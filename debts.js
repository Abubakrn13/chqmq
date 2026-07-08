/* routes/shifts.js — cash-drawer shifts (kassa smenasi).
   Open: cashier records opening cash. Close: records closing cash;
   system computes expected cash from sales/returns/expenses; diff shown. */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub } = require("../auth");
const { publish } = require("../live");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect);
router.use(requireActiveSub);

function currentShift(d, userId) {
  return d.shifts.find((s) => s.userId === userId && !s.closedAt) || null;
}

function computeExpected(d, shift) {
  // Only naqd flow counts toward the cash drawer.
  const sales = d.sales.filter((s) => s.ts >= shift.openedAt && s.userId === shift.userId && s.pay === "Naqd");
  const salesSum = sales.reduce((a, s) => a + (s.paid ?? s.total), 0);
  const returns = d.returns.filter((r) => r.ts >= shift.openedAt && r.userId === shift.userId);
  const returnSum = returns.reduce((a, r) => a + r.amount, 0);
  const expenses = d.expenses.filter((e) => e.paid && e.paidAt && e.paidAt >= shift.openedAt && e.userId === shift.userId);
  const expenseSum = expenses.reduce((a, e) => a + e.amount, 0);
  return {
    salesSum,
    returnSum,
    expenseSum,
    expected: shift.openCash + salesSum - returnSum - expenseSum,
  };
}

// GET /api/shifts/current -> my current open shift (or null)
router.get("/current", (req, res) => {
  const d = db.read();
  const s = currentShift(d, req.user.userId);
  if (!s) return res.json(null);
  const stats = computeExpected(d, s);
  res.json({ ...s, ...stats });
});

// POST /api/shifts/open  { openCash }
router.post("/open", (req, res) => {
  const openCash = Math.max(0, Number(req.body?.openCash) || 0);
  const result = db.update((d) => {
    if (currentShift(d, req.user.userId)) return { err: "Sizda ochiq smena bor" };
    const s = {
      id: uid(),
      shopId: req.user.shopId,
      userId: req.user.userId,
      userName: req.user.name,
      openedAt: Date.now(),
      openCash,
      closedAt: null,
    };
    d.shifts.push(s);
    return { s };
  });
  if (result.err) return res.status(400).json({ error: result.err });
  publish(req.user.shopId, { type: "shift-open", user: req.user.name, userId: req.user.userId, openCash });
  res.json(result.s);
});

// POST /api/shifts/close  { closeCash }
router.post("/close", (req, res) => {
  const closeCash = Math.max(0, Number(req.body?.closeCash) || 0);
  const d = db.read();
  const cur = currentShift(d, req.user.userId);
  if (!cur) return res.status(400).json({ error: "Ochiq smena yo'q" });
  const stats = computeExpected(d, cur);
  const closed = db.update((db2) => {
    const s = db2.shifts.find((x) => x.id === cur.id);
    s.closedAt = Date.now();
    s.closeCash = closeCash;
    s.expected = stats.expected;
    s.diff = closeCash - stats.expected;
    s.salesSum = stats.salesSum;
    s.returnSum = stats.returnSum;
    s.expenseSum = stats.expenseSum;
    return s;
  });
  publish(req.user.shopId, { type: "shift-close", user: req.user.name, userId: req.user.userId, closeCash, diff: closed.diff });
  res.json(closed);
});

// GET /api/shifts -> recent closed shifts (manager view)
router.get("/", (req, res) => {
  const d = db.read();
  const rows = d.shifts
    .filter((s) => s.shopId === req.user.shopId && s.closedAt)
    .sort((a, b) => b.closedAt - a.closedAt)
    .slice(0, 30);
  res.json(rows);
});

module.exports = router;
