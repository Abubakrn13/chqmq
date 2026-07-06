/* routes/transfers.js — move stock between branches.
   Each transfer decreases the source product's stock and increases (or
   creates) the destination-branch equivalent. History is retained. */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireManager, branchScope } = require("../auth");
const { publish } = require("../live");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect); router.use(requireActiveSub);

// POST /api/transfers  { fromBranchId, toBranchId, items:[{productId, qty}], note }
router.post("/", requireManager, (req, res) => {
  const { fromBranchId, toBranchId, items, note } = req.body || {};
  if (!fromBranchId || !toBranchId) return res.status(400).json({ error: "Filiallar tanlanmagan" });
  if (fromBranchId === toBranchId) return res.status(400).json({ error: "Bir xil filialga o'tkazolmaysiz" });
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Mahsulot tanlanmagan" });

  // If the caller is locked to a branch, they can only send FROM their branch.
  if (req.user.branchId && req.user.branchId !== fromBranchId)
    return res.status(403).json({ error: "Faqat o'z filialidan o'tkazish mumkin" });

  const result = db.update((d) => {
    // Sanity: both branches belong to me.
    const f = d.branches.find((b) => b.id === fromBranchId && b.shopId === req.user.shopId);
    const t = d.branches.find((b) => b.id === toBranchId && b.shopId === req.user.shopId);
    if (!f || !t) return { err: "Filial topilmadi" };

    const lines = [];
    for (const it of items) {
      const src = d.products.find((x) => x.id === it.productId && x.shopId === req.user.shopId && (x.branchId || null) === fromBranchId);
      if (!src) return { err: "Mahsulot topilmadi (manba filialda emas)" };
      const isFloat = src.unit === "kg" || src.unit === "litr" || src.unit === "metr";
      const raw = Number(it.qty) || 0;
      const qty = isFloat ? Math.max(0.001, raw) : Math.max(1, Math.floor(raw) || 1);
      if (qty > src.stock) return { err: `"${src.name}" uchun qoldiq yetarli emas (${src.stock} ${src.unit || "dona"})` };

      // Find or create equivalent product on destination side (match by barcode
      // when available, otherwise by name). Create it if it doesn't exist.
      let dst = d.products.find((x) =>
        x.shopId === req.user.shopId &&
        (x.branchId || null) === toBranchId &&
        ((src.barcode && x.barcode === src.barcode) ||
         (!src.barcode && x.name === src.name))
      );
      if (!dst) {
        dst = {
          id: uid(),
          shopId: req.user.shopId,
          branchId: toBranchId,
          name: src.name,
          barcode: src.barcode,
          category: src.category,
          price: src.price,
          cost: src.cost,
          stock: 0,
          low: src.low,
          createdAt: Date.now(),
        };
        d.products.push(dst);
      }
      // Weighted-average cost on the destination side (keeps profit honest).
      const total = dst.stock + qty;
      dst.cost = total ? Math.round(((dst.cost * dst.stock) + (src.cost * qty)) / total) : src.cost;
      dst.stock = total;
      src.stock -= qty;
      lines.push({ name: src.name, qty, cost: src.cost });
    }

    const tr = {
      id: uid(),
      shopId: req.user.shopId,
      fromBranchId,
      toBranchId,
      userId: req.user.userId,
      userName: req.user.name,
      ts: Date.now(),
      items: lines,
      totalValue: lines.reduce((a, l) => a + l.qty * l.cost, 0),
      note: String(note || "").trim(),
    };
    d.transfers = d.transfers || [];
    d.transfers.push(tr);
    return { tr, from: f, to: t };
  });

  if (result.err) return res.status(400).json({ error: result.err });
  publish(req.user.shopId, {
    type: "transfer",
    user: req.user.name,
    userId: req.user.userId,
    fromBranchId, toBranchId,
    totalValue: result.tr.totalValue,
    lines: result.tr.items.length,
  });
  res.json(result.tr);
});

// GET /api/transfers — history, filtered to the current scope where possible
router.get("/", requireManager, (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  const rows = (d.transfers || [])
    .filter((t) => t.shopId === req.user.shopId)
    .filter((t) => !scope || t.fromBranchId === scope || t.toBranchId === scope)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 50);
  res.json(rows);
});

module.exports = router;
