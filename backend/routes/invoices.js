/* routes/invoices.js — kirim faktura (goods received from a supplier).
   Each invoice line increments product stock atomically. */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireManager, branchScope } = require("../auth");
const { publish } = require("../live");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect);
router.use(requireActiveSub);

router.get("/", (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  const rows = d.invoices
    .filter((x) => x.shopId === req.user.shopId)
    .filter((x) => !scope || (x.branchId || null) === scope)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 100);
  res.json(rows);
});

// POST /api/invoices  { supplierId, number, note, items:[{productId, qty, cost}] }
// qty adds to product stock; cost updates the product's cost (moving avg).
router.post("/", requireManager, (req, res) => {
  const { supplierId, number, note, items } = req.body || {};
  if (!Array.isArray(items) || !items.length)
    return res.status(400).json({ error: "Mahsulot qatorlari bo'sh" });
  const effectiveBranchId = req.user.branchId || req.body?.branchId || null;
  const result = db.update((d) => {
    const lines = [];
    for (const it of items) {
      const p = d.products.find((x) => x.id === it.productId && x.shopId === req.user.shopId);
      if (!p) return { err: "Mahsulot topilmadi" };
      if (req.user.branchId && (p.branchId || null) !== req.user.branchId)
        return { err: `"${p.name}" bu filialga tegishli emas` };
      const isFloat = p.unit === "kg" || p.unit === "litr" || p.unit === "metr";
      const raw = Number(it.qty) || 0;
      const qty = isFloat ? Math.max(0.001, raw) : Math.max(1, Math.floor(raw) || 1);
      const cost = Math.max(0, Number(it.cost) || p.cost || 0);
      const totalStock = p.stock + qty;
      p.cost = totalStock ? Math.round(((p.cost * p.stock) + (cost * qty)) / totalStock) : cost;
      p.stock = totalStock;
      lines.push({ productId: p.id, name: p.name, qty, cost, unit: p.unit || "dona" });
    }
    const inv = {
      id: uid(),
      shopId: req.user.shopId,
      branchId: effectiveBranchId,
      supplierId: supplierId || null,
      number: String(number || "").trim(),
      note: String(note || "").trim(),
      items: lines,
      total: lines.reduce((a, l) => a + l.qty * l.cost, 0),
      ts: Date.now(),
    };
    d.invoices.push(inv);
    return { inv };
  });
  if (result.err) return res.status(400).json({ error: result.err });
  publish(req.user.shopId, {
    type: "invoice",
    user: req.user.name,
    userId: req.user.userId,
    branchId: effectiveBranchId,
    total: result.inv.total,
    lines: result.inv.items.length,
  });
  res.json(result.inv);
});

module.exports = router;
