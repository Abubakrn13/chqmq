/* integrations/telegram.js — send messages via bot API + a daily job. */
const db = require("../db");

const DAY = 86400000;
const money = (n) => Math.round(n || 0).toLocaleString("ru-RU").replace(/\u00a0/g, " ").replace(/,/g, " ");

// Send a file (e.g. the daily backup .json) via Telegram bot API.
// Uses multipart/form-data — Node 20+ has FormData & Blob built in.
async function sendDocument(chatId, filename, contents, caption = "") {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN o'rnatilmagan" };
  try {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    if (caption) form.append("caption", caption);
    form.append("document", new Blob([contents], { type: "application/json" }), filename);
    const r = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: form,
    });
    const data = await r.json().catch(() => ({}));
    if (data.ok) return { ok: true, raw: data };
    return { ok: false, error: data.description || `HTTP ${r.status}`, raw: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function sendMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN o'rnatilmagan (server sozlanmagan)" };
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const data = await r.json().catch(() => ({}));
    if (data.ok) return { ok: true, raw: data };
    // Telegram gives useful descriptions — pass them through.
    const desc = data.description || `HTTP ${r.status}`;
    let hint = "";
    if (/chat not found/i.test(desc)) hint = "chat_id noto'g'ri yoki foydalanuvchi botga /start yubormagan";
    else if (/bot was blocked/i.test(desc)) hint = "Foydalanuvchi botni bloklab qo'ygan";
    else if (/Unauthorized/i.test(desc)) hint = "Token noto'g'ri";
    return { ok: false, error: hint ? `${desc} — ${hint}` : desc, raw: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function reportFor(shopId) {
  const d = db.read();
  const shop = d.shops.find((s) => s.id === shopId);
  const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  const yesterday = t0.getTime() - DAY;
  const today = t0.getTime();
  const sales = d.sales.filter((s) => s.shopId === shopId);
  const y = sales.filter((s) => s.ts >= yesterday && s.ts < today);
  const debt = sales.reduce((a, s) => a + Math.max(0, s.total - (s.paid ?? s.total)), 0);
  const products = d.products.filter((p) => p.shopId === shopId);
  const low = products.filter((p) => p.stock <= p.low);
  const rev = y.reduce((a, s) => a + s.total, 0);
  const profit = y.reduce((a, s) => a + s.profit, 0);
  return (
    `<b>${shop?.name || "Do'kon"} — kunlik hisobot</b>\n` +
    `Kecha: <b>${money(rev)} so'm</b> tushum, <b>${money(profit)} so'm</b> foyda, ${y.length} ta sotuv.\n` +
    `Ochiq qarz: ${money(debt)} so'm.\n` +
    `Kam qoldiq: ${low.length} ta mahsulot` +
    (low.length ? "\n• " + low.slice(0, 5).map((p) => `${p.name} (${p.stock})`).join("\n• ") : ".")
  );
}

async function runDailyReports() {
  const d = db.read();
  for (const sub of d.chatIds) {
    if (!sub.enabled) continue;
    await sendMessage(sub.chatId, reportFor(sub.shopId));
  }
}

// Send today's data as a JSON backup file to each linked chat. This gives
// every shop owner an off-server copy of their data automatically — if the
// server ever loses everything, they can send us the file to restore.
async function runDailyBackups() {
  const d = db.read();
  const stamp = new Date().toISOString().slice(0, 10);
  // Group chats by shop so we only build each shop's backup once.
  const byShop = new Map();
  for (const sub of d.chatIds) {
    if (!sub.enabled) continue;
    if (!byShop.has(sub.shopId)) byShop.set(sub.shopId, []);
    byShop.get(sub.shopId).push(sub.chatId);
  }
  for (const [shopId, chats] of byShop) {
    const shop = d.shops.find((s) => s.id === shopId);
    if (!shop) continue;
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
    const filename = `chaqmoq-${shop.name.replace(/[^a-z0-9]/gi, "_")}-${stamp}.json`;
    for (const chatId of chats) {
      await sendDocument(chatId, filename, payload,
        `📦 Kunlik zaxira · ${shop.name}\nSanani: ${stamp}\nMahsulot: ${snapshot.products.length} · Sotuv: ${snapshot.sales.length}\nBu faylni saqlab qo'ying.`
      );
    }
  }
}

// Fire once at server start and then every hour: send at ~09:00 local for each shop.
let lastSent = 0;
let lastBackup = 0;
function startScheduler() {
  setInterval(async () => {
    if (!process.env.TELEGRAM_BOT_TOKEN) return;
    const now = new Date();
    const hour = now.getHours();
    // 09:00 → daily report
    if (hour === 9 && Date.now() - lastSent > 20 * 3600 * 1000) {
      lastSent = Date.now();
      try { await runDailyReports(); } catch (e) { console.error("tg cron:", e.message); }
    }
    // 09:05 → daily backup file (a few minutes later so both aren't racing)
    if (hour === 9 && Date.now() - lastBackup > 20 * 3600 * 1000) {
      lastBackup = Date.now();
      try { await runDailyBackups(); } catch (e) { console.error("tg backup:", e.message); }
    }
  }, 60 * 1000).unref();
}

module.exports = { sendMessage, sendDocument, reportFor, runDailyReports, runDailyBackups, startScheduler };
