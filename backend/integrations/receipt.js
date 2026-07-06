/* integrations/receipt.js — build a printable receipt.
   We emit BOTH: (a) a plain-text 58mm-wide receipt for browser printing
   (kassir prints from a normal thermal printer connected via CUPS/OS),
   and (b) raw ESC/POS bytes as base64 for advanced setups. */
function line(char = "-", w = 32) { return char.repeat(w); }
function pad(left, right, w = 32) {
  const l = String(left), r = String(right);
  const gap = Math.max(1, w - l.length - r.length);
  return l + " ".repeat(gap) + r;
}
const money = (n) => Math.round(n || 0).toLocaleString("ru-RU").replace(/\u00a0/g, " ").replace(/,/g, " ");

function textReceipt(shop, sale, fiscal) {
  const w = 32;
  const at = new Date(sale.ts);
  const time = at.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const date = `${at.getDate().toString().padStart(2, "0")}.${(at.getMonth() + 1).toString().padStart(2, "0")}.${at.getFullYear()}`;
  const L = [];
  L.push(center(shop?.name || "Do'kon", w));
  L.push(center("Chek #" + sale.id.slice(0, 8).toUpperCase(), w));
  L.push(pad(date, time, w));
  L.push(line("=", w));
  sale.items.forEach((it) => {
    L.push(it.name.slice(0, w));
    L.push(pad(`  ${it.qty} x ${money(it.price)}`, money(it.price * it.qty), w));
  });
  L.push(line("-", w));
  L.push(pad("JAMI", money(sale.total) + " so'm", w));
  L.push(pad("To'lov", sale.pay, w));
  if (sale.pay === "Nasiya" && (sale.total - (sale.paid || 0)) > 0) {
    L.push(pad("Qarz", money(sale.total - (sale.paid || 0)) + " so'm", w));
  }
  if (fiscal && fiscal.fiscalId) {
    L.push(line("-", w));
    L.push("Fiskal: " + fiscal.fiscalId);
    if (fiscal.qr) L.push("QR: " + fiscal.qr);
  }
  L.push("");
  L.push(center("Xaridingiz uchun rahmat!", w));
  L.push("");
  L.push("");
  return L.join("\n");
}

function center(s, w) {
  const p = Math.max(0, Math.floor((w - s.length) / 2));
  return " ".repeat(p) + s;
}

module.exports = { textReceipt };
