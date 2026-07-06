/* integrations/markirovka.js — verify a Data Matrix mark against Asl Belgi.
   If MARKIROVKA_API_KEY isn't set, we accept any non-empty code in test mode. */
async function verifyMark(code) {
  const apiUrl = process.env.MARKIROVKA_API_URL || "";
  const apiKey = process.env.MARKIROVKA_API_KEY || "";
  if (!code || String(code).trim().length < 6)
    return { ok: false, error: "Kod juda qisqa" };

  if (!apiUrl || !apiKey) {
    return { ok: true, mode: "test", status: "valid", note: "Markirovka sozlanmagan — sinov rejim" };
  }
  try {
    const r = await fetch(apiUrl, {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": "Bearer " + apiKey },
      body: JSON.stringify({ code }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Markirovka ${r.status}`);
    return { ok: true, mode: "real", status: data.status || "valid", raw: data };
  } catch (e) {
    return { ok: false, mode: "real", error: e.message };
  }
}
module.exports = { verifyMark };
