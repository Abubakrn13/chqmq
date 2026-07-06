/* routes/debts.js — outstanding credit (Nasiya) sales + repayments. */
const express = require("express");
const db = require("../db");
const { protect, requireActiveSub, branchScope } = require("../auth");
const { publish } = require("../live");

const router = express.Router();
router.use(protect);
router.use(requireActiveSub);

// GET /api/debts  -> unpaid credit sales, newest first
router.get("/", (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  const rows = d.sales
    .filter((s) => s.shopId === req.user.shopId && Math.max(0, s.total - (s.paid ?? s.total)) > 0)
    .filter((s) => !scope || (s.branchId || null) === scope)
    .sort((a, b) => b.ts - a.ts)
    .map((s) => {
      const c = s.customerId ? d.customers.find((x) => x.id === s.customerId) : null;
      return {
        id: s.id,
        ts: s.ts,
        total: s.total,
        paid: s.paid ?? 0,
        outstanding: Math.max(0, s.total - (s.paid ?? s.total)),
        customerId: s.customerId,
        customerName: c ? c.name : "Noma'lum mijoz",
        customerPhone: c ? c.phone : "",
        items: s.items,
      };
    });
  const totalDebt = rows.reduce((a, r) => a + r.outstanding, 0);
  res.json({ totalDebt, rows });
});

// POST /api/debts/pay  { saleId, amount }
router.post("/pay", (req, res) => {
  const { saleId, amount } = req.body || {};
  const amt = Math.max(0, Number(amount) || 0);
  if (!amt) return res.status(400).json({ error: "To'lov summasi noto'g'ri" });
  const sale = db.update((d) => {
    const s = d.sales.find((x) => x.id === saleId && x.shopId === req.user.shopId);
    if (!s) return null;
    s.paid = Math.min(s.total, (s.paid ?? 0) + amt);
    return s;
  });
  if (!sale) return res.status(404).json({ error: "Sotuv topilmadi" });
  publish(req.user.shopId, {
    type: "debt-pay",
    user: req.user.name,
    userId: req.user.userId,
    amount: amt,
  });
  res.json({ id: sale.id, paid: sale.paid, outstanding: Math.max(0, sale.total - sale.paid) });
});

module.exports = router;
