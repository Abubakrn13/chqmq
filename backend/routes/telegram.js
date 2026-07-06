/* routes/telegram.js — link/unlink a Telegram chat and send a test report. */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireOwner } = require("../auth");
const { sendMessage, sendDocument, reportFor } = require("../integrations/telegram");

const router = express.Router();
const uid = () => crypto.randomUUID();
router.use(protect); router.use(requireActiveSub);

// GET /api/telegram/status -> is the server-side bot token configured?
router.get("/status", (req, res) => {
  res.json({ configured: !!process.env.TELEGRAM_BOT_TOKEN });
});

// GET /api/telegram -> my shop's linked chats
router.get("/", (req, res) => {
  const d = db.read();
  res.json(d.chatIds.filter((c) => c.shopId === req.user.shopId));
});

// POST /api/telegram/link  { chatId, name }
router.post("/link", requireOwner, (req, res) => {
  const chatId = String(req.body?.chatId || "").trim();
  if (!chatId) return res.status(400).json({ error: "chat_id majburiy" });
  const row = {
    id: uid(),
    shopId: req.user.shopId,
    chatId,
    name: String(req.body?.name || "").trim(),
    enabled: true,
    createdAt: Date.now(),
  };
  db.update((d) => d.chatIds.push(row));
  res.json(row);
});

// DELETE /api/telegram/:id
router.delete("/:id", requireOwner, (req, res) => {
  db.update((d) => { d.chatIds = d.chatIds.filter((c) => !(c.id === req.params.id && c.shopId === req.user.shopId)); });
  res.json({ ok: true });
});

// POST /api/telegram/test -> send a report right now to all my chats
router.post("/test", requireOwner, async (req, res) => {
  const d = db.read();
  const chats = d.chatIds.filter((c) => c.shopId === req.user.shopId);
  if (!chats.length) return res.status(400).json({ error: "Bog'langan chat yo'q" });
  const text = reportFor(req.user.shopId);
  const results = [];
  for (const c of chats) results.push({ chatId: c.chatId, ...(await sendMessage(c.chatId, text)) });
  res.json({ results });
});

// POST /api/telegram/backup -> send a JSON backup file right now to all my chats
router.post("/backup", requireOwner, async (req, res) => {
  const d = db.read();
  const shopId = req.user.shopId;
  const chats = d.chatIds.filter((c) => c.shopId === shopId);
  if (!chats.length) return res.status(400).json({ error: "Bog'langan chat yo'q" });
  const shop = d.shops.find((s) => s.id === shopId);
  const only = (arr) => arr.filter((x) => x.shopId === shopId);
  const snapshot = {
    schemaVersion: 1,
    exportedAt: Date.now(),
    shop,
    branches: only(d.branches),
    users: only(d.users).map(({ passwordHash, ...u }) => u),
    products: only(d.products),
    sales: only(d.sales),
    customers: only(d.customers),
    returns: only(d.returns),
    expenses: only(d.expenses),
    suppliers: only(d.suppliers),
    invoices: only(d.invoices),
    shifts: only(d.shifts),
  };
  const payload = JSON.stringify(snapshot, null, 2);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `chaqmoq-${(shop?.name || "backup").replace(/[^a-z0-9]/gi, "_")}-${stamp}.json`;
  const caption = `📦 Zaxira · ${shop?.name || ""}\nSana: ${stamp}\nMahsulot: ${snapshot.products.length} · Sotuv: ${snapshot.sales.length}\nBu faylni saqlab qo'ying — zaruriyat tug'ilsa ma'lumotni tiklashda ishlatiladi.`;
  const results = [];
  for (const c of chats) {
    results.push({ chatId: c.chatId, ...(await sendDocument(c.chatId, filename, payload, caption)) });
  }
  res.json({ results });
});

module.exports = router;
