/* routes/backup.js — full-shop export (backup) and product CSV.
   Owners can download everything as one JSON file for safekeeping,
   or products as CSV for use in Excel. */
const express = require("express");
const db = require("../db");
const { protect, requireActiveSub, requireOwner } = require("../auth");

const router = express.Router();
router.use(protect); router.use(requireActiveSub);

// GET /api/backup — download a JSON snapshot of everything in the shop
router.get("/", requireOwner, (req, res) => {
  const d = db.read();
  const shopId = req.user.shopId;
  const only = (arr) => arr.filter((x) => x.shopId === shopId);
  const snapshot = {
    schemaVersion: 1,
    exportedAt: Date.now(),
    shop: d.shops.find((s) => s.id === shopId),
    branches: only(d.branches),
    users: only(d.users).map(({ passwordHash, ...u }) => u), // never leak hashes
    products: only(d.products),
    sales: only(d.sales),
    customers: only(d.customers),
    returns: only(d.returns),
    expenses: only(d.expenses),
    suppliers: only(d.suppliers),
    invoices: only(d.invoices),
    shifts: only(d.shifts),
  };
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="chaqmoq-backup-${stamp}.json"`);
  res.end(JSON.stringify(snapshot, null, 2));
});

// GET /api/backup/products.csv — spreadsheet-friendly product list
router.get("/products.csv", requireOwner, (req, res) => {
  const d = db.read();
  const shopId = req.user.shopId;
  const rows = d.products.filter((p) => p.shopId === shopId);
  const branchName = (id) => (d.branches.find((b) => b.id === id) || {}).name || "";
  const esc = (v) => {
    const s = String(v == null ? "" : v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = "Nom;Shtrix-kod;Kategoriya;Sotuv narxi;Tannarx;Qoldiq;Kam qoldiq;Filial\n";
  const body = rows.map((p) =>
    [p.name, p.barcode, p.category, p.price, p.cost, p.stock, p.low, branchName(p.branchId)].map(esc).join(";")
  ).join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="mahsulotlar-${stamp}.csv"`);
  // BOM so Excel opens Uzbek Latin letters correctly
  res.end("\uFEFF" + header + body);
});

// GET /api/backup/sales.csv — sales history for accounting
router.get("/sales.csv", requireOwner, (req, res) => {
  const d = db.read();
  const shopId = req.user.shopId;
  const rows = d.sales.filter((s) => s.shopId === shopId).sort((a, b) => a.ts - b.ts);
  const branchName = (id) => (d.branches.find((b) => b.id === id) || {}).name || "";
  const custName = (id) => (d.customers.find((c) => c.id === id) || {}).name || "";
  const esc = (v) => {
    const s = String(v == null ? "" : v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = "Sana;Vaqt;Filial;Sotuvchi;Mijoz;To'lov;Summa;Foyda;Qatorlar\n";
  const body = rows.map((s) => {
    const dt = new Date(s.ts);
    return [
      dt.toISOString().slice(0, 10),
      dt.toTimeString().slice(0, 5),
      branchName(s.branchId),
      s.userName || "",
      custName(s.customerId),
      s.pay,
      s.total,
      s.profit,
      s.items.map((i) => `${i.name} x${i.qty}`).join(", "),
    ].map(esc).join(";");
  }).join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="sotuvlar-${stamp}.csv"`);
  res.end("\uFEFF" + header + body);
});

module.exports = router;
