/* routes/returns.js — product returns that restock inventory, branch-scoped. */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, branchScope } = require("../auth");
const { publish } = require("../live");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect); router.use(requireActiveSub);

router.get("/", (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  res.json(
    d.returns
      .filter((r) => r.shopId === req.user.shopId)
      .filter((r) => !scope || (r.branchId || null) === scope)
      .sort((a, b) => b.ts - a.ts)
  );
});

router.post("/", (req, res) => {
  const { items, reason } = req.body || {};
  if (!Array.isArray(items) || !items.length)
    return res.status(400).json({ error: "Qaytariladigan mahsulot tanlanmadi" });

  const effectiveBranchId = req.user.branchId || req.body?.branchId || null;

  const result = db.update((d) => {
    const lines = [];
    for (const it of items) {
      const p = d.products.find((x) => x.id === it.productId && x.shopId === req.user.shopId);
      if (!p) return { error: "Mahsulot topilmadi" };
      if (req.user.branchId && (p.branchId || null) !== req.user.branchId)
        return { error: `"${p.name}" bu filialga tegishli emas` };
      const isFloat = p.unit === "kg" || p.unit === "litr" || p.unit === "metr";
      const raw = Number(it.qty) || 0;
      const qty = isFloat ? Math.max(0.001, raw) : Math.max(1, Math.floor(raw) || 1);
      lines.push({ productId: p.id, name: p.name, price: p.price, qty, unit: p.unit || "dona" });
      p.stock += qty;
    }
    const amount = lines.reduce((a, l) => a + l.price * l.qty, 0);
    const ret = {
      id: uid(),
      shopId: req.user.shopId,
      branchId: effectiveBranchId,
      userId: req.user.userId,
      userName: req.user.name,
      ts: Date.now(),
      items: lines,
      amount,
      reason: String(reason || "").trim(),
    };
    d.returns.push(ret);
    return { ret };
  });
  if (result.error) return res.status(400).json({ error: result.error });
  publish(req.user.shopId, {
    type: "return",
    user: req.user.name,
    userId: req.user.userId,
    branchId: effectiveBranchId,
    amount: result.ret.amount,
    itemCount: result.ret.items.reduce((a, x) => a + x.qty, 0),
  });
  res.json(result.ret);
});

module.exports = router;
