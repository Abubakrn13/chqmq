/* routes/suppliers.js — yetkazib beruvchilar. */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireManager } = require("../auth");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect);
router.use(requireActiveSub);

router.get("/", (req, res) => {
  const d = db.read();
  res.json(d.suppliers.filter((s) => s.shopId === req.user.shopId).sort((a, b) => a.name.localeCompare(b.name)));
});

router.post("/", requireManager, (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Yetkazib beruvchi nomi majburiy" });
  const s = {
    id: uid(),
    shopId: req.user.shopId,
    name,
    phone: String(req.body?.phone || "").trim(),
    note: String(req.body?.note || "").trim(),
    createdAt: Date.now(),
  };
  db.update((d) => d.suppliers.push(s));
  res.json(s);
});

router.put("/:id", requireManager, (req, res) => {
  const s = db.update((d) => {
    const x = d.suppliers.find((y) => y.id === req.params.id && y.shopId === req.user.shopId);
    if (!x) return null;
    ["name", "phone", "note"].forEach((k) => { if (req.body?.[k] !== undefined) x[k] = String(req.body[k]).trim(); });
    return x;
  });
  if (!s) return res.status(404).json({ error: "Topilmadi" });
  res.json(s);
});

router.delete("/:id", requireManager, (req, res) => {
  db.update((d) => { d.suppliers = d.suppliers.filter((y) => !(y.id === req.params.id && y.shopId === req.user.shopId)); });
  res.json({ ok: true });
});

module.exports = router;
