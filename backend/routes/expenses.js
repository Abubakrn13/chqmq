/* routes/expenses.js — expenses incl. rent (Arenda). category: "Arenda" | "Kommunal" | "Ish haqi" | "Boshqa" */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireManager, branchScope } = require("../auth");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect);
router.use(requireActiveSub);

// GET /api/expenses?category=Arenda
router.get("/", (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  let rows = d.expenses.filter((e) => e.shopId === req.user.shopId);
  if (scope) rows = rows.filter((e) => (e.branchId || null) === scope);
  if (req.query.category) rows = rows.filter((e) => e.category === req.query.category);
  rows.sort((a, b) => (b.dueDate || b.createdAt) - (a.dueDate || a.createdAt));
  res.json(rows);
});

// POST /api/expenses  { title, amount, category, dueDate, paid, note }
router.post("/", requireManager, (req, res) => {
  const title = String(req.body?.title || "").trim();
  const amount = Math.max(0, Number(req.body?.amount) || 0);
  if (!title || !amount) return res.status(400).json({ error: "Nom va summa majburiy" });
  const e = {
    id: uid(),
    shopId: req.user.shopId,
    branchId: req.user.branchId || req.body?.branchId || null,
    title,
    amount,
    category: req.body?.category || "Boshqa",
    dueDate: req.body?.dueDate ? Number(req.body.dueDate) : null,
    paid: !!req.body?.paid,
    note: String(req.body?.note || "").trim(),
    createdAt: Date.now(),
  };
  db.update((d) => d.expenses.push(e));
  res.json(e);
});

// PUT /api/expenses/:id  (mark paid / edit)
router.put("/:id", requireManager, (req, res) => {
  const e = db.update((d) => {
    const x = d.expenses.find((y) => y.id === req.params.id && y.shopId === req.user.shopId);
    if (!x) return null;
    if (req.body?.paid !== undefined) x.paid = !!req.body.paid;
    if (req.body?.title !== undefined) x.title = String(req.body.title).trim();
    if (req.body?.amount !== undefined) x.amount = Math.max(0, Number(req.body.amount) || 0);
    if (req.body?.dueDate !== undefined) x.dueDate = req.body.dueDate ? Number(req.body.dueDate) : null;
    return x;
  });
  if (!e) return res.status(404).json({ error: "Yozuv topilmadi" });
  res.json(e);
});

// DELETE /api/expenses/:id
router.delete("/:id", requireManager, (req, res) => {
  db.update((d) => {
    d.expenses = d.expenses.filter((y) => !(y.id === req.params.id && y.shopId === req.user.shopId));
  });
  res.json({ ok: true });
});

module.exports = router;
