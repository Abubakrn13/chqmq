/* routes/branches.js — branch directory + creates a manager login per branch.
   Each shop has one "Asosiy filial" from registration. Adding a branch
   optionally creates a manager account bound to that branch: their token
   carries branchId, and every scoped read/write is limited to it. */
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireManager, requireOwner } = require("../auth");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect);
router.use(requireActiveSub);

// GET /api/branches -> branches with 30-day metrics (owner sees all; branch users see only theirs)
router.get("/", (req, res) => {
  const d = db.read();
  const from = Date.now() - 30 * 86400000;
  const sales = d.sales.filter((s) => s.shopId === req.user.shopId && s.ts >= from);
  const mine = d.branches.filter((b) => b.shopId === req.user.shopId);
  const scoped = req.user.branchId ? mine.filter((b) => b.id === req.user.branchId) : mine;
  const rows = scoped.map((b) => {
    const bs = sales.filter((s) => (s.branchId || null) === b.id);
    return {
      ...b,
      revenue: bs.reduce((a, s) => a + s.total, 0),
      profit: bs.reduce((a, s) => a + s.profit, 0),
      count: bs.length,
    };
  });
  res.json(rows);
});

// POST /api/branches  { name, address, managerName?, managerPhone?, managerPassword? }
// Creating a branch is a manager-level action; if manager creds are provided,
// we also create a bound manager account.
router.post("/", requireOwner, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Filial nomi majburiy" });
  const branchId = uid();
  const b = {
    id: branchId,
    shopId: req.user.shopId,
    name,
    address: String(req.body?.address || "").trim(),
    createdAt: Date.now(),
  };
  // Optional manager credentials — creates a user locked to this branch.
  const managerPhone = String(req.body?.managerPhone || "").trim();
  const managerPassword = String(req.body?.managerPassword || "").trim();
  const managerName = String(req.body?.managerName || "").trim() || (name + " menejeri");
  let created = null;

  if (managerPhone || managerPassword) {
    if (!managerPhone || !managerPassword)
      return res.status(400).json({ error: "Menejer uchun login va parolni ikkalasini kiriting" });
    if (managerPassword.length < 4)
      return res.status(400).json({ error: "Menejer paroli kamida 4 belgi" });
    const dbData = db.read();
    if (dbData.users.some((u) => u.phone === managerPhone))
      return res.status(409).json({ error: "Bu login band" });
    const hash = await bcrypt.hash(managerPassword, 10);
    created = {
      id: uid(),
      shopId: req.user.shopId,
      branchId,
      name: managerName,
      phone: managerPhone,
      passwordHash: hash,
      role: "manager",
      createdAt: Date.now(),
    };
  }
  db.update((d) => {
    d.branches.push(b);
    if (created) d.users.push(created);
  });
  res.json({ ...b, revenue: 0, profit: 0, count: 0, manager: created ? { name: created.name, phone: created.phone } : null });
});

router.put("/:id", requireOwner, (req, res) => {
  const b = db.update((d) => {
    const x = d.branches.find((y) => y.id === req.params.id && y.shopId === req.user.shopId);
    if (!x) return null;
    if (req.body?.name !== undefined) x.name = String(req.body.name).trim();
    if (req.body?.address !== undefined) x.address = String(req.body.address).trim();
    return x;
  });
  if (!b) return res.status(404).json({ error: "Filial topilmadi" });
  res.json(b);
});

router.delete("/:id", requireOwner, (req, res) => {
  db.update((d) => {
    d.branches = d.branches.filter((y) => !(y.id === req.params.id && y.shopId === req.user.shopId));
    // Also detach any user bound to this branch (they can no longer log in until reassigned)
    d.users.forEach((u) => { if (u.branchId === req.params.id) u.branchId = null; });
  });
  res.json({ ok: true });
});

module.exports = router;
