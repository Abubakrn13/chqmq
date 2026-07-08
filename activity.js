/* routes/audit.js — inventory audit (inventarizatsiya).
   The manager counts what's actually on the shelf, the system compares
   with the recorded stock and flags discrepancies. Committing an audit
   updates each product's stock to the counted value. */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireManager, branchScope } = require("../auth");
const { publish } = require("../live");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect); router.use(requireActiveSub);

// GET /api/audit/sheet — return every product with recorded stock so the
// manager can print or fill counts on the panel.
router.get("/sheet", requireManager, (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  const products = d.products
    .filter((p) => p.shopId === req.user.shopId)
    .filter((p) => !scope || (p.branchId || null) === scope)
    .map((p) => ({
      id: p.id,
      name: p.name,
      barcode: p.barcode,
      category: p.category,
      recorded: p.stock,
      branchId: p.branchId || null,
      cost: p.cost,
    }));
  res.json({ generatedAt: Date.now(), products });
});

// POST /api/audit — commit an audit: items = [{ productId, counted }]
// The server computes diffs, updates stock, and records the audit for history.
router.post("/", requireManager, (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: "Sanalgan mahsulot yo'q" });
  const note = String(req.body?.note || "").trim();

  const result = db.update((d) => {
    const lines = [];
    let missingValue = 0;
    let excessValue = 0;
    for (const it of items) {
      const p = d.products.find((x) => x.id === it.productId && x.shopId === req.user.shopId);
      if (!p) continue;
      const isFloat = p.unit === "kg" || p.unit === "litr" || p.unit === "metr";
      const raw = Number(it.counted) || 0;
      const counted = isFloat ? Math.max(0, raw) : Math.max(0, Math.floor(raw));
      const diff = counted - p.stock;
      lines.push({
        productId: p.id,
        name: p.name,
        recorded: p.stock,
        counted,
        diff,
        cost: p.cost,
      });
      // Money impact = missing quantity × cost.
      if (diff < 0) missingValue += Math.abs(diff) * (p.cost || 0);
      else if (diff > 0) excessValue += diff * (p.cost || 0);
      p.stock = counted;
    }
    const audit = {
      id: uid(),
      shopId: req.user.shopId,
      branchId: req.user.branchId || req.body?.branchId || null,
      userId: req.user.userId,
      userName: req.user.name,
      ts: Date.now(),
      note,
      items: lines,
      missingValue,
      excessValue,
    };
    d.audits = d.audits || [];
    d.audits.push(audit);
    return { audit };
  });
  publish(req.user.shopId, {
    type: "audit",
    user: req.user.name,
    userId: req.user.userId,
    branchId: req.user.branchId || null,
    missingValue: result.audit.missingValue,
    excessValue: result.audit.excessValue,
    lines: result.audit.items.length,
  });
  res.json(result.audit);
});

// GET /api/audit — audit history for the shop
router.get("/", requireManager, (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  const rows = (d.audits || [])
    .filter((a) => a.shopId === req.user.shopId)
    .filter((a) => !scope || (a.branchId || null) === scope)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 30);
  res.json(rows);
});

module.exports = router;
