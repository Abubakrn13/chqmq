/* routes/staff.js — owner manages cashiers/managers for the shop. */
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireManager, requireOwner } = require("../auth");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect);
router.use(requireActiveSub);

// GET /api/staff  -> list users in my shop (excluding password hashes)
router.get("/", requireManager, (req, res) => {
  const d = db.read();
  const rows = d.users
    .filter((u) => u.shopId === req.user.shopId)
    .map((u) => ({ id: u.id, name: u.name, phone: u.phone, role: u.role, branchId: u.branchId || null, createdAt: u.createdAt }));
  res.json(rows);
});

// POST /api/staff  { name, phone, password, role, branchId? }
router.post("/", requireOwner, async (req, res) => {
  const { name, phone, password, role, branchId } = req.body || {};
  if (!name || !phone || !password) return res.status(400).json({ error: "Ism, telefon va parol majburiy" });
  if (String(password).length < 4) return res.status(400).json({ error: "Parol kamida 4 belgi" });
  if (!["cashier", "manager"].includes(role)) return res.status(400).json({ error: "Rol noto'g'ri" });
  const data = db.read();
  if (data.users.some((u) => u.phone === phone)) return res.status(409).json({ error: "Bu login band" });
  // If branchId given, ensure it belongs to my shop.
  if (branchId) {
    const b = data.branches.find((x) => x.id === branchId && x.shopId === req.user.shopId);
    if (!b) return res.status(400).json({ error: "Filial topilmadi" });
  }
  // Managers created by the owner without a branchId can view all branches
  // (like the owner); managers with a branchId are locked to that branch.
  // Cashiers must be attached to a branch — default to the manager's branch.
  let bId = branchId || null;
  if (role === "cashier" && !bId) {
    bId = req.user.branchId || (data.branches.find((b) => b.shopId === req.user.shopId) || {}).id || null;
  }

  const hash = await bcrypt.hash(String(password), 10);
  const user = {
    id: uid(),
    shopId: req.user.shopId,
    branchId: bId,
    name: String(name).trim(),
    phone: String(phone).trim(),
    passwordHash: hash,
    role,
    createdAt: Date.now(),
  };
  db.update((d) => d.users.push(user));
  res.json({ id: user.id, name: user.name, phone: user.phone, role: user.role, branchId: user.branchId });
});

// PUT /api/staff/:id  { name?, role?, password? }
router.put("/:id", requireOwner, async (req, res) => {
  const patch = req.body || {};
  const result = await new Promise((resolve) => {
    db.update((d) => {
      const u = d.users.find((x) => x.id === req.params.id && x.shopId === req.user.shopId);
      if (!u) return resolve(null);
      if (u.role === "owner") return resolve({ error: "Egasi tahrirlanmaydi" });
      if (patch.name) u.name = String(patch.name).trim();
      if (["cashier", "manager"].includes(patch.role)) u.role = patch.role;
      if (patch.password && String(patch.password).length >= 4) {
        // async hash below cannot be awaited here; handle outside.
        resolve({ user: u, hashRequired: String(patch.password) });
        return;
      }
      resolve({ user: u });
    });
  });
  if (!result) return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
  if (result.error) return res.status(400).json({ error: result.error });
  if (result.hashRequired) {
    const hash = await bcrypt.hash(result.hashRequired, 10);
    db.update((d) => {
      const u = d.users.find((x) => x.id === req.params.id);
      if (u) u.passwordHash = hash;
    });
  }
  res.json({ id: result.user.id, name: result.user.name, role: result.user.role });
});

// DELETE /api/staff/:id
router.delete("/:id", requireOwner, (req, res) => {
  const result = db.update((d) => {
    const u = d.users.find((x) => x.id === req.params.id && x.shopId === req.user.shopId);
    if (!u) return { err: "Topilmadi" };
    if (u.role === "owner") return { err: "Egasi o'chirilmaydi" };
    d.users = d.users.filter((x) => x.id !== req.params.id);
    return { ok: true };
  });
  if (result.err) return res.status(400).json({ error: result.err });
  res.json({ ok: true });
});

module.exports = router;
