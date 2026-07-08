/* routes/products.js — inventory scoped to shop + branch.
   Each product belongs to one branch; owner/manager without a branchId
   can view all branches (or filter with ?branchId=). */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireManager, branchScope } = require("../auth");
const { log } = require("./activity");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect); router.use(requireActiveSub);

// GET /api/products
router.get("/", (req, res) => {
  const data = db.read();
  const scope = branchScope(req);
  let rows = data.products.filter((p) => p.shopId === req.user.shopId);
  if (scope) rows = rows.filter((p) => (p.branchId || null) === scope);
  res.json(rows);
});

// GET /api/products/barcode/:code
router.get("/barcode/:code", (req, res) => {
  const data = db.read();
  const scope = branchScope(req);
  let candidates = data.products.filter(
    (x) => x.shopId === req.user.shopId && x.barcode === req.params.code
  );
  if (scope) candidates = candidates.filter((p) => (p.branchId || null) === scope);
  const p = candidates[0];
  if (!p) return res.status(404).json({ error: "Mahsulot topilmadi" });
  res.json(p);
});

// POST /api/products
router.post("/", requireManager, (req, res) => {
  // Whitelist fields — never spread req.body directly. Otherwise a client
  // could inject shopId, id, createdAt, or unrelated fields.
  const UNITS = new Set(["dona", "kg", "litr", "metr", "pors"]);
  const b = req.body || {};
  const unit = UNITS.has(b.unit) ? b.unit : "dona";
  const isFloat = unit === "kg" || unit === "litr" || unit === "metr";
  const p = {
    id: uid(),
    createdAt: Date.now(),
    shopId: req.user.shopId,
    branchId: req.user.branchId || b.branchId || null,
    name: String(b.name || "").trim(),
    barcode: String(b.barcode || "").trim(),
    category: String(b.category || "").trim(),
    unit,
    supplierId: b.supplierId ? String(b.supplierId) : null,
    price: Math.max(0, Number(b.price) || 0),
    cost: Math.max(0, Number(b.cost) || 0),
    stock: isFloat ? Math.max(0, Number(b.stock) || 0) : Math.max(0, Math.floor(Number(b.stock) || 0)),
    low: isFloat ? Math.max(0, Number(b.low) || 0) : Math.max(0, Math.floor(Number(b.low) || 0)),
  };
  if (!p.name) return res.status(400).json({ error: "Mahsulot nomi majburiy" });
  db.update((d) => d.products.push(p));
  log(req, "product.create", { productId: p.id, name: p.name, branchId: p.branchId });
  res.json(p);
});

// PUT /api/products/:id
router.put("/:id", requireManager, (req, res) => {
  const scope = branchScope(req);
  const updated = db.update((d) => {
    const p = d.products.find((x) => x.id === req.params.id && x.shopId === req.user.shopId);
    if (!p) return null;
    if (scope && (p.branchId || null) !== scope) return null;
    const UNITS = new Set(["dona", "kg", "litr", "metr", "pors"]);
    const unit = UNITS.has(req.body.unit) ? req.body.unit : (p.unit || "dona");
    const isFloat = unit === "kg" || unit === "litr" || unit === "metr";
    Object.assign(p, {
      name: String(req.body.name || p.name).trim(),
      barcode: String(req.body.barcode || p.barcode).trim(),
      category: String(req.body.category || p.category).trim(),
      unit,
      price: Math.max(0, Number(req.body.price) || 0),
      cost: Math.max(0, Number(req.body.cost) || 0),
      stock: isFloat ? Math.max(0, Number(req.body.stock) || 0) : Math.max(0, Math.floor(Number(req.body.stock) || 0)),
      low: isFloat ? Math.max(0, Number(req.body.low) || 0) : Math.max(0, Math.floor(Number(req.body.low) || 0)),
    });
    return p;
  });
  if (!updated) return res.status(404).json({ error: "Mahsulot topilmadi" });
  log(req, "product.update", { productId: updated.id, name: updated.name });
  res.json(updated);
});

// DELETE /api/products/:id
router.delete("/:id", requireManager, (req, res) => {
  const scope = branchScope(req);
  const d0 = db.read();
  const gone = d0.products.find((p) => p.id === req.params.id && p.shopId === req.user.shopId);
  if (!gone) return res.status(404).json({ error: "Mahsulot topilmadi" });
  if (scope && (gone.branchId || null) !== scope)
    return res.status(403).json({ error: "Bu filial mahsuloti emas" });
  db.update((d) => {
    d.products = d.products.filter((p) => !(p.id === req.params.id && p.shopId === req.user.shopId));
  });
  log(req, "product.delete", { productId: gone.id, name: gone.name });
  res.json({ ok: true });
});

module.exports = router;
