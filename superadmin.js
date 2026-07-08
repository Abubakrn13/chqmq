/* routes/reorder.js — auto reorder suggestions.
   Groups low-stock products by supplier and sends a formatted order draft
   to the shop's linked Telegram chats. The manager reviews and forwards
   it to the actual supplier. */
const express = require("express");
const db = require("../db");
const { protect, requireActiveSub, requireManager, branchScope } = require("../auth");
const { sendMessage } = require("../integrations/telegram");

const router = express.Router();
router.use(protect); router.use(requireActiveSub); router.use(requireManager);

// Suggested reorder quantity for a product: enough to bring stock to ~3× low.
// Falls back to (low + 10) if no low threshold set. Rounds up to whole units
// except for weight-based products (which stay decimal).
function suggestQty(p) {
  const target = (p.low > 0 ? p.low * 3 : 10) - p.stock;
  if (target <= 0) return 0;
  const isFloat = p.unit === "kg" || p.unit === "litr" || p.unit === "metr";
  return isFloat ? Math.round(target * 100) / 100 : Math.ceil(target);
}

// GET /api/reorder — preview which products to reorder and from whom
router.get("/", (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  const products = d.products
    .filter((p) => p.shopId === req.user.shopId)
    .filter((p) => !scope || (p.branchId || null) === scope)
    .filter((p) => p.stock <= p.low);
  // Group by preferredSupplierId if present, else "unspecified"
  const groups = new Map();
  for (const p of products) {
    const supId = p.supplierId || "unspecified";
    if (!groups.has(supId)) groups.set(supId, []);
    groups.get(supId).push({
      id: p.id,
      name: p.name,
      unit: p.unit || "dona",
      stock: p.stock,
      low: p.low,
      suggested: suggestQty(p),
      cost: p.cost,
    });
  }
  const suppliers = d.suppliers.filter((s) => s.shopId === req.user.shopId);
  const rows = [];
  for (const [supId, items] of groups) {
    const s = suppliers.find((x) => x.id === supId);
    rows.push({
      supplierId: supId === "unspecified" ? null : supId,
      supplierName: s?.name || "Yetkazib beruvchi tanlanmagan",
      supplierPhone: s?.phone || "",
      items,
      estCost: items.reduce((a, x) => a + x.cost * x.suggested, 0),
    });
  }
  rows.sort((a, b) => b.estCost - a.estCost);
  res.json({ groups: rows, totalLowProducts: products.length });
});

// POST /api/reorder/send  { supplierId } — send order draft to Telegram chats
router.post("/send", async (req, res) => {
  const { supplierId } = req.body || {};
  const d = db.read();
  const chats = d.chatIds.filter((c) => c.shopId === req.user.shopId && c.enabled);
  if (!chats.length) return res.status(400).json({ error: "Bog'langan Telegram chat yo'q" });

  const scope = branchScope(req);
  const supplier = supplierId
    ? d.suppliers.find((x) => x.id === supplierId && x.shopId === req.user.shopId)
    : null;
  const products = d.products
    .filter((p) => p.shopId === req.user.shopId)
    .filter((p) => !scope || (p.branchId || null) === scope)
    .filter((p) => p.stock <= p.low)
    .filter((p) => (supplierId ? p.supplierId === supplierId : !p.supplierId));

  if (!products.length) return res.status(400).json({ error: "Buyurtma qilinadigan mahsulot yo'q" });

  const shop = d.shops.find((s) => s.id === req.user.shopId);
  const lines = products.map((p, i) => `${i + 1}. ${p.name} — <b>${suggestQty(p)} ${p.unit || "dona"}</b>`);
  const estCost = products.reduce((a, p) => a + p.cost * suggestQty(p), 0);
  const text =
    `<b>📦 Buyurtma</b>\n` +
    `${shop?.name || ""}\n` +
    (supplier ? `Yetkazib beruvchi: <b>${supplier.name}</b>\n` : "") +
    (supplier?.phone ? `Telefon: ${supplier.phone}\n` : "") +
    `\n${lines.join("\n")}\n\n` +
    `Taxminiy tannarx: <b>${estCost.toLocaleString()} so'm</b>\n` +
    `\n<i>Buyurtmani yetkazib beruvchiga yuborishdan oldin ko'rib chiqing.</i>`;

  const results = [];
  for (const c of chats) {
    results.push({ chatId: c.chatId, ...(await sendMessage(c.chatId, text)) });
  }
  res.json({ results, sent: results.filter((r) => r.ok).length });
});

module.exports = router;
