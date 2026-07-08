/* ============================================================
   routes/superadmin.js — platform owner view over all shops.
   Rich management: metrics, search, edit shop, reset credentials,
   extend/pause access, delete shop (with all data), platform stats.
   ============================================================ */
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { requireSuper, subActive } = require("../auth");
const { createShopAccount } = require("./auth");

const router = express.Router();
const DAY = 86400000;
router.use(requireSuper);

// POST /api/superadmin/shops -> create a shop + owner login
router.post("/shops", async (req, res) => {
  const r = await createShopAccount(req.body || {});
  if (r.error) return res.status(r.code || 400).json({ error: r.error });
  res.json({ shop: r.shop, user: r.user });
});

// GET /api/superadmin/shops  ?q=&sort=revenue|created|active
router.get("/shops", (req, res) => {
  const d = db.read();
  const q = String(req.query.q || "").toLowerCase().trim();
  const sortBy = req.query.sort || "revenue";
  const rows = d.shops.map((s) => {
    const owner = d.users.find((u) => u.shopId === s.id && u.role === "owner");
    const sales = d.sales.filter((x) => x.shopId === s.id);
    const monthSales = sales.filter((x) => x.ts >= Date.now() - 30 * DAY);
    return {
      id: s.id,
      name: s.name,
      createdAt: s.createdAt,
      subscription: s.subscription || { status: "active", activeUntil: null },
      owner: owner ? { id: owner.id, name: owner.name, phone: owner.phone } : null,
      branches: d.branches.filter((b) => b.shopId === s.id).length,
      users: d.users.filter((u) => u.shopId === s.id).length,
      products: d.products.filter((p) => p.shopId === s.id).length,
      salesCount: sales.length,
      revenue: sales.reduce((a, x) => a + x.total, 0),
      monthRevenue: monthSales.reduce((a, x) => a + x.total, 0),
      lastSaleAt: sales.length ? Math.max(...sales.map((x) => x.ts)) : null,
    };
  });
  const filtered = q
    ? rows.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        (r.owner?.name || "").toLowerCase().includes(q) ||
        (r.owner?.phone || "").toLowerCase().includes(q)
      )
    : rows;
  const sorters = {
    revenue: (a, b) => b.revenue - a.revenue,
    monthRevenue: (a, b) => b.monthRevenue - a.monthRevenue,
    created: (a, b) => b.createdAt - a.createdAt,
    active: (a, b) => Number(subActive(b.subscription)) - Number(subActive(a.subscription)),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  filtered.sort(sorters[sortBy] || sorters.revenue);
  const active = rows.filter((r) => subActive(r.subscription)).length;
  const totalRevenue = rows.reduce((a, r) => a + r.revenue, 0);
  const totalMonth = rows.reduce((a, r) => a + r.monthRevenue, 0);
  res.json({
    shops: filtered,
    totals: {
      shops: rows.length,
      active,
      expired: rows.length - active,
      revenue: totalRevenue,
      monthRevenue: totalMonth,
      users: d.users.filter((u) => u.role !== "superadmin").length,
      products: d.products.length,
    },
  });
});

// GET /api/superadmin/shops/:id -> full detail incl. staff and recent activity
router.get("/shops/:id", (req, res) => {
  const d = db.read();
  const shop = d.shops.find((s) => s.id === req.params.id);
  if (!shop) return res.status(404).json({ error: "Do'kon topilmadi" });
  const branches = d.branches.filter((b) => b.shopId === shop.id);
  const users = d.users
    .filter((u) => u.shopId === shop.id)
    .map((u) => ({ id: u.id, name: u.name, phone: u.phone, role: u.role, branchId: u.branchId || null, createdAt: u.createdAt }));
  const sales = d.sales.filter((s) => s.shopId === shop.id);
  const recent = [...sales].sort((a, b) => b.ts - a.ts).slice(0, 10).map((s) => ({
    id: s.id, ts: s.ts, total: s.total, pay: s.pay, userName: s.userName, branchId: s.branchId,
  }));
  const monthFrom = Date.now() - 30 * DAY;
  const month = sales.filter((s) => s.ts >= monthFrom);
  res.json({
    shop,
    branches,
    users,
    recent,
    metrics: {
      revenue: sales.reduce((a, s) => a + s.total, 0),
      profit: sales.reduce((a, s) => a + s.profit, 0),
      monthRevenue: month.reduce((a, s) => a + s.total, 0),
      salesCount: sales.length,
      products: d.products.filter((p) => p.shopId === shop.id).length,
      customers: d.customers.filter((c) => c.shopId === shop.id).length,
    },
  });
});

// PUT /api/superadmin/shops/:id  { name }
router.put("/shops/:id", (req, res) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim())
    return res.status(400).json({ error: "Do'kon nomini kiriting" });
  const shop = db.update((d) => {
    const s = d.shops.find((x) => x.id === req.params.id);
    if (!s) return null;
    s.name = String(name).trim();
    return s;
  });
  if (!shop) return res.status(404).json({ error: "Do'kon topilmadi" });
  res.json(shop);
});

// POST /api/superadmin/shops/:id/subscription  { days, status }
router.post("/shops/:id/subscription", (req, res) => {
  const { days, status } = req.body || {};
  const shop = db.update((d) => {
    const s = d.shops.find((x) => x.id === req.params.id);
    if (!s) return null;
    s.subscription = s.subscription || {};
    if (status) s.subscription.status = status;
    if (days !== undefined && days !== null && days !== "") {
      const n = Math.max(0, Math.floor(Number(days) || 0));
      s.subscription.startedAt = Date.now();
      s.subscription.activeUntil = Date.now() + n * DAY;
      if (!status) s.subscription.status = "active";
    }
    return s;
  });
  if (!shop) return res.status(404).json({ error: "Do'kon topilmadi" });
  res.json(shop);
});

// POST /api/superadmin/shops/:id/extend  { days } — add N days to activeUntil
router.post("/shops/:id/extend", (req, res) => {
  const n = Math.max(1, Math.floor(Number(req.body?.days) || 0));
  if (!n) return res.status(400).json({ error: "Kunlar noto'g'ri" });
  const shop = db.update((d) => {
    const s = d.shops.find((x) => x.id === req.params.id);
    if (!s) return null;
    s.subscription = s.subscription || {};
    const from = subActive(s.subscription) ? s.subscription.activeUntil : Date.now();
    s.subscription.activeUntil = from + n * DAY;
    s.subscription.status = "active";
    return s;
  });
  if (!shop) return res.status(404).json({ error: "Do'kon topilmadi" });
  res.json(shop);
});

// POST /api/superadmin/shops/:id/reset-owner-password  { password }
router.post("/shops/:id/reset-owner-password", async (req, res) => {
  const pw = String(req.body?.password || "").trim();
  if (pw.length < 4) return res.status(400).json({ error: "Parol kamida 4 belgi" });
  const d = db.read();
  const owner = d.users.find((u) => u.shopId === req.params.id && u.role === "owner");
  if (!owner) return res.status(404).json({ error: "Egasi topilmadi" });
  const hash = await bcrypt.hash(pw, 10);
  db.update((x) => {
    const u = x.users.find((y) => y.id === owner.id);
    if (u) u.passwordHash = hash;
  });
  res.json({ ok: true, phone: owner.phone });
});

// PUT /api/superadmin/shops/:id/owner  { phone } — change owner's login
router.put("/shops/:id/owner", (req, res) => {
  const phone = String(req.body?.phone || "").trim();
  if (!phone) return res.status(400).json({ error: "Login majburiy" });
  const d = db.read();
  const owner = d.users.find((u) => u.shopId === req.params.id && u.role === "owner");
  if (!owner) return res.status(404).json({ error: "Egasi topilmadi" });
  if (d.users.some((u) => u.id !== owner.id && u.phone === phone))
    return res.status(409).json({ error: "Bu login band" });
  db.update((x) => {
    const u = x.users.find((y) => y.id === owner.id);
    if (u) u.phone = phone;
  });
  res.json({ ok: true, phone });
});

// DELETE /api/superadmin/shops/:id — hard delete shop + all its data
router.delete("/shops/:id", (req, res) => {
  const shopId = req.params.id;
  const d = db.read();
  const shop = d.shops.find((s) => s.id === shopId);
  if (!shop) return res.status(404).json({ error: "Do'kon topilmadi" });
  const collections = ["shops", "users", "products", "sales", "customers", "returns", "expenses", "branches", "shifts", "suppliers", "invoices", "chatIds"];
  db.update((x) => {
    for (const c of collections) {
      x[c] = (x[c] || []).filter((y) => y.shopId !== shopId && y.id !== shopId);
    }
    // safety: also drop by id for shops collection
    x.shops = x.shops.filter((s) => s.id !== shopId);
  });
  res.json({ ok: true, name: shop.name });
});

// GET /api/superadmin/stats — platform-wide dashboard numbers
router.get("/stats", (req, res) => {
  const d = db.read();
  const now = Date.now();
  const monthFrom = now - 30 * DAY;
  const weekFrom = now - 7 * DAY;
  const shops = d.shops;
  const activeShops = shops.filter((s) => subActive(s.subscription));
  const sales = d.sales;
  const monthSales = sales.filter((s) => s.ts >= monthFrom);
  const weekSales = sales.filter((s) => s.ts >= weekFrom);

  // Top shops by month revenue
  const bySh = {};
  monthSales.forEach((s) => { bySh[s.shopId] = (bySh[s.shopId] || 0) + s.total; });
  const topShops = Object.entries(bySh)
    .map(([id, revenue]) => ({
      id, revenue,
      name: (shops.find((s) => s.id === id) || {}).name || "?",
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Shops expiring in the next 3 days
  const soon = shops.filter((s) => {
    const t = s.subscription?.activeUntil;
    return t && t > now && t - now <= 3 * DAY;
  }).map((s) => ({
    id: s.id,
    name: s.name,
    endsAt: s.subscription.activeUntil,
    daysLeft: Math.ceil((s.subscription.activeUntil - now) / DAY),
  }));

  // Signups per day (last 30)
  const days = {};
  shops.forEach((s) => {
    const dt = new Date(s.createdAt); dt.setHours(0, 0, 0, 0);
    const k = dt.getTime();
    if (k >= monthFrom) days[k] = (days[k] || 0) + 1;
  });
  const daily = Object.entries(days).map(([ts, n]) => ({ ts: Number(ts), count: n }))
    .sort((a, b) => a.ts - b.ts);

  res.json({
    shops: {
      total: shops.length,
      active: activeShops.length,
      expired: shops.length - activeShops.length,
    },
    users: d.users.filter((u) => u.role !== "superadmin").length,
    products: d.products.length,
    revenue: {
      all: sales.reduce((a, s) => a + s.total, 0),
      month: monthSales.reduce((a, s) => a + s.total, 0),
      week: weekSales.reduce((a, s) => a + s.total, 0),
    },
    salesCount: {
      all: sales.length,
      month: monthSales.length,
    },
    topShops,
    expiringSoon: soon,
    dailySignups: daily,
  });
});

module.exports = router;
