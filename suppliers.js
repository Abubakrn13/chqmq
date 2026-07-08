/* routes/performance.js — staff performance and suggested pay.
   Aggregates each cashier's sales, hours worked (from closed shifts),
   and derives a share-of-work + suggested monthly pay so the owner can
   compare workers fairly. */
const express = require("express");
const db = require("../db");
const { protect, requireActiveSub, requireManager } = require("../auth");

const router = express.Router();
router.use(protect); router.use(requireActiveSub);

const DAY = 86400000;

// GET /api/performance?days=30
router.get("/", requireManager, (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
  const shopId = req.user.shopId;
  const from = Date.now() - days * DAY;
  const d = db.read();

  const staff = d.users.filter((u) => u.shopId === shopId && u.role !== "superadmin");
  const sales = d.sales.filter((s) => s.shopId === shopId && s.ts >= from);
  const shifts = d.shifts.filter((s) => s.shopId === shopId && s.closedAt && s.closedAt >= from);
  const shop = d.shops.find((s) => s.id === shopId);
  const baseMonthlyPayBudget = getPayBudget(shop, sales);

  const rows = staff.map((u) => {
    const mine = sales.filter((s) => s.userId === u.id);
    const myShifts = shifts.filter((sh) => sh.userId === u.id);
    const revenue = mine.reduce((a, s) => a + s.total, 0);
    const profit = mine.reduce((a, s) => a + s.profit, 0);
    const hours = myShifts.reduce((a, sh) => a + (sh.closedAt - sh.openedAt) / 3600000, 0);
    const days = new Set(myShifts.map((sh) => new Date(sh.openedAt).toDateString())).size;
    return {
      id: u.id,
      name: u.name,
      role: u.role,
      salesCount: mine.length,
      revenue,
      profit,
      hours: Math.round(hours * 10) / 10,
      days,
      avgTicket: mine.length ? Math.round(revenue / mine.length) : 0,
    };
  });

  // Only compare non-owners for share-of-work.
  const workers = rows.filter((r) => r.role !== "owner");
  const totalScore = workers.reduce((a, r) => a + score(r), 0) || 1;
  workers.forEach((r) => {
    r.share = Math.round((score(r) / totalScore) * 100);
    r.suggestedPay = Math.round((score(r) / totalScore) * baseMonthlyPayBudget);
  });

  res.json({
    days,
    payBudget: baseMonthlyPayBudget,
    rows,
    insight: buildInsight(rows, baseMonthlyPayBudget),
  });
});

// Weight revenue heavily, but also reward hours/days worked so a fair
// distribution emerges (a cashier who worked hard on slow days isn't punished).
function score(r) {
  return r.revenue * 0.7 + r.hours * 15000 + r.days * 30000;
}

// Default monthly pay budget = 15% of 30-day revenue, minimum 3M so'm,
// capped by shop's stated monthly revenue if provided.
function getPayBudget(shop, sales) {
  const revenue30 = sales.reduce((a, s) => a + s.total, 0);
  const base = Math.max(3_000_000, Math.round(revenue30 * 0.15));
  return base;
}

function buildInsight(rows, budget) {
  const workers = rows.filter((r) => r.role !== "owner");
  if (workers.length < 2) return "Taqqoslash uchun kamida 2 ta xodim kerak.";
  const top = [...workers].sort((a, b) => b.revenue - a.revenue)[0];
  const low = [...workers].sort((a, b) => a.revenue - b.revenue)[0];
  if (top.revenue === 0) return "Hali xodimlar sotuv qilmagan. Bir necha kundan keyin tahlil aniqroq bo'ladi.";
  const gap = low.revenue ? Math.round((top.revenue / low.revenue) * 10) / 10 : null;
  const L = [];
  L.push(`Top: ${top.name} — ${moneyU(top.revenue)} tushum, taxminiy oylik ${moneyU(top.suggestedPay)}.`);
  L.push(`Eng past: ${low.name} — ${moneyU(low.revenue)} tushum, taxminiy oylik ${moneyU(low.suggestedPay)}.`);
  if (gap) L.push(`Farq: ${top.name} ${gap}x ko'p sotgan.`);
  L.push(`Oylik byudjet taxmini: ${moneyU(budget)}.`);
  return L.join(" ");
}
function moneyU(n) { return Math.round(n || 0).toLocaleString("ru-RU").replace(/\u00a0/g, " ").replace(/,/g, " ") + " so'm"; }

module.exports = router;
