/* ============================================================
   routes/sales.js — checkout + reporting, scoped to the shop.
   Supports credit sales (Nasiya) that create a tracked debt,
   optional branchId, plus today's list, stats and a dashboard
   summary. Stock is decremented atomically on checkout.
   ============================================================ */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, branchScope } = require("../auth");
const { sendReceipt } = require("../integrations/ofd");
const { textReceipt } = require("../integrations/receipt");
const { publish } = require("../live");
const { log } = require("./activity");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect);
router.use(requireActiveSub);

// POST /api/sales
router.post("/", async (req, res) => {
  const { items, pay, customerId, paid, branchId, discount, discountPercent } = req.body || {};
  if (!Array.isArray(items) || !items.length)
    return res.status(400).json({ error: "Savatcha bo'sh" });

  const effectiveBranchId = req.user.branchId || branchId || null;

  const result = db.update((d) => {
    const lines = [];
    for (const it of items) {
      const p = d.products.find((x) => x.id === it.productId && x.shopId === req.user.shopId);
      if (!p) return { error: "Mahsulot topilmadi" };
      // If user is locked to a branch, refuse selling products from other branches.
      if (req.user.branchId && (p.branchId || null) !== req.user.branchId)
        return { error: `"${p.name}" bu filialga tegishli emas` };
      // Weight-based products accept fractional quantities.
      const isFloat = p.unit === "kg" || p.unit === "litr" || p.unit === "metr";
      const raw = Number(it.qty) || 0;
      const qty = isFloat ? Math.max(0.001, raw) : Math.max(1, Math.floor(raw) || 1);
      if (qty > p.stock) return { error: `"${p.name}" uchun qoldiq yetarli emas (${p.stock} ${p.unit || "dona"})` };
      lines.push({ productId: p.id, name: p.name, price: p.price, cost: p.cost, qty, unit: p.unit || "dona" });
    }
    for (const ln of lines) {
      d.products.find((x) => x.id === ln.productId).stock -= ln.qty;
    }
    const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
    // Discount: either a flat sum (discount) or a percent (discountPercent).
    // A percent is applied to subtotal; a flat sum is capped at subtotal.
    let disc = 0;
    let discPct = Number(discountPercent) > 0 ? Math.min(100, Math.max(0, Number(discountPercent))) : 0;
    // Cashiers are capped by the shop's `maxDiscountForCashier` setting
    // (default 0). Managers and owners can override — they're the ones
    // authorized to give generous discounts. This closes an obvious hole:
    // a cashier can't secretly zero-out a receipt.
    const shop = d.shops.find((s) => s.id === req.user.shopId) || {};
    const cap = req.user.role === "cashier" ? Math.max(0, Number(shop.maxDiscountForCashier) || 0) : 100;
    if (discPct > cap) discPct = cap;
    if (discPct > 0) {
      disc = Math.round(subtotal * discPct / 100);
    } else if (Number(discount) > 0) {
      const flatCap = req.user.role === "cashier" ? Math.round(subtotal * cap / 100) : subtotal;
      disc = Math.min(subtotal, flatCap, Math.max(0, Math.floor(Number(discount) || 0)));
    }
    const total = subtotal - disc;
    // Profit shrinks by the discount amount — customer saved that from us.
    const rawProfit = lines.reduce((a, l) => a + (l.price - l.cost) * l.qty, 0);
    const profit = rawProfit - disc;
    const isCredit = pay === "Nasiya";
    const paidAmount = isCredit ? Math.max(0, Math.min(total, Number(paid) || 0)) : total;

    const sale = {
      id: uid(),
      shopId: req.user.shopId,
      userId: req.user.userId,
      userName: req.user.name,
      branchId: effectiveBranchId,
      customerId: customerId || null,
      ts: Date.now(),
      items: lines,
      subtotal,
      discount: disc,
      discountPercent: discPct,
      total,
      profit,
      pay: pay || "Naqd",
      paid: paidAmount,
    };
    d.sales.push(sale);
    return { sale, shop: d.shops.find((s) => s.id === req.user.shopId) };
  });

  if (result.error) return res.status(400).json({ error: result.error });

  let fiscal = null;
  try {
    fiscal = await sendReceipt(result.sale);
    if (fiscal && fiscal.ok) {
      db.update((d) => {
        const s = d.sales.find((x) => x.id === result.sale.id);
        if (s) s.fiscal = { id: fiscal.fiscalId, qr: fiscal.qr, mode: fiscal.mode, at: fiscal.at };
      });
    }
  } catch (e) {
    console.error("OFD error:", e.message);
  }

  const receiptText = textReceipt(result.shop, result.sale, fiscal || {});
  publish(req.user.shopId, {
    type: "sale",
    user: req.user.name,
    userId: req.user.userId,
    branchId: effectiveBranchId,
    total: result.sale.total,
    itemCount: result.sale.items.reduce((a, x) => a + x.qty, 0),
    pay: result.sale.pay,
    saleId: result.sale.id,
  });
  log(req, "sale", {
    saleId: result.sale.id,
    total: result.sale.total,
    discount: result.sale.discount,
    pay: result.sale.pay,
    lines: result.sale.items.length,
    branchId: effectiveBranchId,
  });
  res.json({ ...result.sale, fiscal, receiptText });
});

// GET /api/sales/today
router.get("/today", (req, res) => {
  const data = db.read();
  const scope = branchScope(req);
  const from = startOfToday();
  const rows = data.sales
    .filter((s) => s.shopId === req.user.shopId && s.ts >= from)
    .filter((s) => !scope || (s.branchId || null) === scope)
    .sort((a, b) => b.ts - a.ts)
    .map((s) => withCustomer(s, data));
  res.json(rows);
});

// GET /api/sales/stats?days=7
router.get("/stats", (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 7));
  const data = db.read();
  const scope = branchScope(req);
  const mineSales = data.sales.filter((s) => s.shopId === req.user.shopId).filter((s) => !scope || (s.branchId || null) === scope);
  const mineProducts = data.products.filter((p) => p.shopId === req.user.shopId).filter((p) => !scope || (p.branchId || null) === scope);
  const from = days === 1 ? startOfToday() : Date.now() - days * 86400000;
  const sales = mineSales.filter((s) => s.ts >= from);

  const revenue = sales.reduce((a, s) => a + s.total, 0);
  const profit = sales.reduce((a, s) => a + s.profit, 0);
  const count = sales.length;
  const avg = count ? revenue / count : 0;

  res.json({
    revenue,
    profit,
    count,
    avg,
    daily: dailySeries(mineSales),
    top: topProducts(sales),
    pays: payBreakdown(sales),
    low: mineProducts
      .filter((p) => p.stock <= p.low)
      .sort((a, b) => a.stock - b.stock)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock, low: p.low })),
  });
});

// GET /api/sales/summary
router.get("/summary", (req, res) => {
  const data = db.read();
  const shopId = req.user.shopId;
  const scope = branchScope(req);
  const sales = data.sales.filter((s) => s.shopId === shopId).filter((s) => !scope || (s.branchId || null) === scope);
  const products = data.products.filter((p) => p.shopId === shopId).filter((p) => !scope || (p.branchId || null) === scope);
  const today = startOfToday();
  const monthFrom = Date.now() - 30 * 86400000;

  const todays = sales.filter((s) => s.ts >= today);
  const month = sales.filter((s) => s.ts >= monthFrom);

  const outstanding = sales.reduce((a, s) => a + Math.max(0, s.total - (s.paid ?? s.total)), 0);
  const returns = data.returns.filter((r) => r.shopId === shopId && r.ts >= monthFrom).filter((r) => !scope || (r.branchId || null) === scope);
  const returnSum = returns.reduce((a, r) => a + r.amount, 0);

  res.json({
    today: {
      revenue: todays.reduce((a, s) => a + s.total, 0),
      profit: todays.reduce((a, s) => a + s.profit, 0),
      count: todays.length,
    },
    month: {
      revenue: month.reduce((a, s) => a + s.total, 0),
      profit: month.reduce((a, s) => a + s.profit, 0),
      count: month.length,
      returns: returnSum,
    },
    debtsOutstanding: outstanding,
    lowStock: products.filter((p) => p.stock <= p.low).length,
    customers: data.customers.filter((c) => c.shopId === shopId).filter((c) => !scope || (c.branchId || null) === scope).length,
    daily: dailySeries(sales),
    top: topProducts(month),
    recent: sales
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 6)
      .map((s) => withCustomer(s, data)),
  });
});

/* ---------- helpers ---------- */
function withCustomer(s, data) {
  const c = s.customerId ? data.customers.find((x) => x.id === s.customerId) : null;
  return { ...s, customerName: c ? c.name : null, outstanding: Math.max(0, s.total - (s.paid ?? s.total)) };
}
function dailySeries(sales) {
  const out = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const start = d.getTime();
    const end = start + 86400000;
    out.push({ ts: start, total: sales.filter((x) => x.ts >= start && x.ts < end).reduce((a, x) => a + x.total, 0) });
  }
  return out;
}
function topProducts(sales) {
  const map = {};
  sales.forEach((s) =>
    s.items.forEach((it) => {
      map[it.name] = map[it.name] || { qty: 0, sum: 0 };
      map[it.name].qty += it.qty;
      map[it.name].sum += it.price * it.qty;
    })
  );
  return Object.entries(map)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);
}
function payBreakdown(sales) {
  const m = {};
  sales.forEach((s) => (m[s.pay] = (m[s.pay] || 0) + s.total));
  return Object.entries(m)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

module.exports = router;
