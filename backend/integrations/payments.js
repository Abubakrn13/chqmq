/* integrations/payments.js — create Payme / Click checkout links.
   If credentials aren't set, we return a mock link so the UI works. */
function createPaymeCheckout(sale) {
  const merchantId = process.env.PAYME_MERCHANT_ID || "";
  const endpoint = process.env.PAYME_ENDPOINT || "https://checkout.paycom.uz";
  if (!merchantId) {
    return { ok: true, mode: "test", url: `https://payme.example/pay/${sale.id}`, note: "Payme sozlanmagan" };
  }
  // Payme accepts a base64-encoded params string appended to the checkout URL.
  const raw = `m=${merchantId};ac.order_id=${sale.id};a=${Math.round(sale.total * 100)}`;
  const url = `${endpoint}/${Buffer.from(raw).toString("base64")}`;
  return { ok: true, mode: "real", url };
}

function createClickCheckout(sale) {
  const merchantId = process.env.CLICK_MERCHANT_ID || "";
  const serviceId = process.env.CLICK_SERVICE_ID || "";
  if (!merchantId || !serviceId) {
    return { ok: true, mode: "test", url: `https://click.example/pay/${sale.id}`, note: "Click sozlanmagan" };
  }
  const url =
    `https://my.click.uz/services/pay?service_id=${serviceId}` +
    `&merchant_id=${merchantId}&amount=${sale.total}&transaction_param=${sale.id}`;
  return { ok: true, mode: "real", url };
}

module.exports = { createPaymeCheckout, createClickCheckout };
