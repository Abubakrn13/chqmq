/* routes/payments.js — create checkout links for a sale on demand. */
const express = require("express");
const db = require("../db");
const { protect, requireActiveSub } = require("../auth");
const { createPaymeCheckout, createClickCheckout } = require("../integrations/payments");
const router = express.Router();
router.use(protect); router.use(requireActiveSub);

router.post("/:provider", (req, res) => {
  const { saleId } = req.body || {};
  const d = db.read();
  const sale = d.sales.find((s) => s.id === saleId && s.shopId === req.user.shopId);
  if (!sale) return res.status(404).json({ error: "Sotuv topilmadi" });
  if (req.params.provider === "payme") return res.json(createPaymeCheckout(sale));
  if (req.params.provider === "click") return res.json(createClickCheckout(sale));
  res.status(400).json({ error: "Noma'lum provayder" });
});
module.exports = router;
