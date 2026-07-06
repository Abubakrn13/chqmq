/* integrations/ofd.js — send a sale to the fiscal-data operator (OFD).
   Provider is chosen via OFD_PROVIDER env. If no provider is configured,
   we run a mock ("test") mode so the flow works end-to-end. Real
   credentials → real HTTP call. */
const crypto = require("crypto");

async function sendReceipt(sale) {
  const provider = process.env.OFD_PROVIDER || "";
  const apiUrl = process.env.OFD_API_URL || "";
  const apiKey = process.env.OFD_API_KEY || "";
  const tin = process.env.OFD_TIN || "";

  if (!provider || !apiUrl || !apiKey) {
    return {
      ok: true,
      mode: "test",
      fiscalId: "TEST-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
      qr: `https://ofd.example/receipt/${sale.id}`,
      at: Date.now(),
      note: "OFD sozlanmagan — sinov chek",
    };
  }

  try {
    const body = buildBody(provider, sale, tin);
    const r = await fetch(apiUrl, {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": "Bearer " + apiKey },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`OFD ${r.status}: ${JSON.stringify(data).slice(0, 200)}`);
    return {
      ok: true,
      mode: "real",
      provider,
      fiscalId: data.fiscalId || data.id || data.receiptId || null,
      qr: data.qr || data.qrUrl || null,
      raw: data,
      at: Date.now(),
    };
  } catch (e) {
    return { ok: false, mode: "real", provider, error: e.message, at: Date.now() };
  }
}

function buildBody(provider, sale, tin) {
  const items = sale.items.map((it) => ({
    name: it.name, qty: it.qty, price: it.price, total: it.price * it.qty,
  }));
  const base = { tin, ts: sale.ts, total: sale.total, pay: sale.pay, items };
  if (provider === "sofd") return { ...base, receipt_type: "sale" };
  if (provider === "mplus") return { ...base, kind: 1 };
  if (provider === "myofd") return { ...base, operation: "sell" };
  if (provider === "solkassa") return { ...base, doctype: "sale" };
  return base;
}

module.exports = { sendReceipt };
