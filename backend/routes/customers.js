/* routes/customers.js — customer directory with live debt totals, branch-scoped. */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, branchScope } = require("../auth");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect); router.use(requireActiveSub);

function debtOf(customerId, sales) {
  return sales
    .filter((s) => s.customerId === customerId)
    .reduce((a, s) => a + Math.max(0, s.total - (s.paid ?? s.total)), 0);
}

router.get("/", (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  const sales = d.sales.filter((s) => s.shopId === req.user.shopId);
  const rows = d.customers
    .filter((c) => c.shopId === req.user.shopId)
    .filter((c) => !scope || (c.branchId || null) === scope)
    .map((c) => ({ ...c, debt: debtOf(c.id, sales) }))
    .sort((a, b) => b.debt - a.debt || a.name.localeCompare(b.name));
  res.json(rows);
});

router.post("/", (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Mijoz ismi majburiy" });
  const c = {
    id: uid(),
    shopId: req.user.shopId,
    branchId: req.user.branchId || req.body?.branchId || null,
    name,
    phone: String(req.body?.phone || "").trim(),
    note: String(req.body?.note || "").trim(),
    createdAt: Date.now(),
  };
  db.update((x) => x.customers.push(c));
  res.json({ ...c, debt: 0 });
});

router.put("/:id", (req, res) => {
  const scope = branchScope(req);
  const c = db.update((d) => {
    const cust = d.customers.find((x) => x.id === req.params.id && x.shopId === req.user.shopId);
    if (!cust) return null;
    if (scope && (cust.branchId || null) !== scope) return null;
    ["name", "phone", "note"].forEach((k) => {
      if (req.body?.[k] !== undefined) cust[k] = String(req.body[k]).trim();
    });
    return cust;
  });
  if (!c) return res.status(404).json({ error: "Mijoz topilmadi" });
  res.json(c);
});

router.delete("/:id", (req, res) => {
  const scope = branchScope(req);
  db.update((d) => {
    d.customers = d.customers.filter((x) => {
      if (x.id !== req.params.id || x.shopId !== req.user.shopId) return true;
      if (scope && (x.branchId || null) !== scope) return true;
      return false;
    });
  });
  res.json({ ok: true });
});

module.exports = router;
