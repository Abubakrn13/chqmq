/* routes/supplierAnalytics.js — how each supplier contributes to profit.
   For every supplier we join their invoices (goods bought from them) with
   the sales of those same products to work out what they've earned us. */
const express = require("express");
const db = require("../db");
const { protect, requireActiveSub, requireManager } = require("../auth");

const router = express.Router();
router.use(protect); router.use(requireActiveSub); router.use(requireManager);

// GET /api/supplier-analytics?days=90
router.get("/", (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 90));
  const from = Date.now() - days * 86400000;
  const d = db.read();
  const shopId = req.user.shopId;
  const suppliers = d.suppliers.filter((s) => s.shopId === shopId);
  const products = d.products.filter((p) => p.shopId === shopId);
  const invoices = d.invoices.filter((i) => i.shopId === shopId && i.ts >= from);
  const sales = d.sales.filter((s) => s.shopId === shopId && s.ts >= from);

  // Which products came from which supplier (based on invoices)
  const productToSupplier = {};
  for (const inv of invoices) {
    if (!inv.supplierId) continue;
    for (const line of (inv.items || [])) {
      // Latest invoice wins so we credit the current supplier
      productToSupplier[line.productId] = inv.supplierId;
    }
  }
  // Products with no invoice history: rely on their supplierId field, if any
  for (const p of products) {
    if (!productToSupplier[p.id] && p.supplierId) productToSupplier[p.id] = p.supplierId;
  }

  // Accumulate metrics per supplier
  const rows = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    spent: 0,          // how much we paid them (invoices)
    revenue: 0,        // how much we sold their goods for
    profit: 0,         // revenue - cost basis
    unitsBought: 0,
    unitsSold: 0,
    productCount: 0,
    lastInvoice: null,
  }));
  const bySupplierId = {};
  rows.forEach((r) => { bySupplierId[r.id] = r; });

  // Invoices: spent + latest
  for (const inv of invoices) {
    const r = bySupplierId[inv.supplierId];
    if (!r) continue;
    r.spent += inv.total || 0;
    for (const line of (inv.items || [])) r.unitsBought += line.qty || 0;
    if (!r.lastInvoice || inv.ts > r.lastInvoice) r.lastInvoice = inv.ts;
  }
  // Sales: revenue & profit
  for (const sale of sales) {
    for (const line of (sale.items || [])) {
      const supId = productToSupplier[line.productId];
      if (!supId) continue;
      const r = bySupplierId[supId];
      if (!r) continue;
      r.revenue += line.price * line.qty;
      r.profit += (line.price - line.cost) * line.qty;
      r.unitsSold += line.qty;
    }
  }
  // productCount
  const supProds = {};
  for (const [pId, sId] of Object.entries(productToSupplier)) {
    supProds[sId] = (supProds[sId] || 0) + 1;
  }
  rows.forEach((r) => { r.productCount = supProds[r.id] || 0; });

  // Sort by profit (best first)
  rows.sort((a, b) => b.profit - a.profit);

  const totals = rows.reduce(
    (a, r) => ({
      spent: a.spent + r.spent,
      revenue: a.revenue + r.revenue,
      profit: a.profit + r.profit,
    }),
    { spent: 0, revenue: 0, profit: 0 }
  );
  res.json({ days, totals, suppliers: rows });
});

module.exports = router;
