/* routes/targets.js — per-user monthly targets and progress.
   Owner sets a daily or monthly goal for each cashier; the panel shows
   progress vs the target so staff know where they stand at any moment. */
const express = require("express");
const db = require("../db");
const { protect, requireActiveSub, requireManager, branchScope } = require("../auth");

const router = express.Router();
router.use(protect); router.use(requireActiveSub);

function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
function startOfMonth() { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime(); }

// GET /api/targets — current user's own progress. Owners see everyone.
router.get("/", (req, res) => {
  const d = db.read();
  const shopId = req.user.shopId;
  const scope = branchScope(req);
  // Only owners/managers see the full team; a cashier sees their own row.
  const isBoss = req.user.role === "owner" || req.user.role === "manager";
  const users = d.users.filter((u) => u.shopId === shopId && u.role !== "superadmin");
  const scoped = scope ? users.filter((u) => (u.branchId || null) === scope) : users;
  const visible = isBoss ? scoped : scoped.filter((u) => u.id === req.user.userId);

  const todayFrom = startOfToday();
  const monthFrom = startOfMonth();
  const rows = visible.map((u) => {
    const mine = d.sales.filter((s) => s.shopId === shopId && s.userId === u.id);
    const today = mine.filter((s) => s.ts >= todayFrom).reduce((a, s) => a + s.total, 0);
    const month = mine.filter((s) => s.ts >= monthFrom).reduce((a, s) => a + s.total, 0);
    const t = (u.target || {});
    return {
      userId: u.id,
      userName: u.name,
      role: u.role,
      branchId: u.branchId || null,
      target: {
        daily: t.daily || 0,
        monthly: t.monthly || 0,
      },
      progress: {
        today,
        month,
        dailyPct: t.daily ? Math.min(100, Math.round(today / t.daily * 100)) : 0,
        monthlyPct: t.monthly ? Math.min(100, Math.round(month / t.monthly * 100)) : 0,
      },
    };
  });
  res.json(rows);
});

// PUT /api/targets/:userId  { daily, monthly } — owners/managers only
router.put("/:userId", requireManager, (req, res) => {
  const daily = Math.max(0, Math.floor(Number(req.body?.daily) || 0));
  const monthly = Math.max(0, Math.floor(Number(req.body?.monthly) || 0));
  const updated = db.update((d) => {
    const u = d.users.find((x) => x.id === req.params.userId && x.shopId === req.user.shopId);
    if (!u) return null;
    u.target = { daily, monthly };
    return u;
  });
  if (!updated) return res.status(404).json({ error: "Xodim topilmadi" });
  res.json({ userId: updated.id, target: updated.target });
});

module.exports = router;
