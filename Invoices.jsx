import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { money, money0, fmtDate, fmtTime } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

// Inventory audit: manager counts what's on the shelf, we compare with the
// system's recorded stock, then commit — updating stock to counted values.
export default function Audit() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [counts, setCounts] = useState({});           // productId -> string
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function load() {
    try {
      const s = await api.get("/audit/sheet");
      setProducts(s.products);
      setHistory(await api.get("/audit"));
    } catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const list = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q));
  }, [products, search]);

  // Only rows where the manager actually filled a count are included.
  const items = useMemo(() => {
    const out = [];
    for (const p of products) {
      const raw = counts[p.id];
      if (raw === "" || raw === undefined) continue;
      const counted = Math.max(0, Math.floor(Number(raw) || 0));
      out.push({ productId: p.id, counted, recorded: p.recorded, name: p.name, cost: p.cost });
    }
    return out;
  }, [counts, products]);

  const missingValue = items.reduce((a, x) => a + (x.counted < x.recorded ? (x.recorded - x.counted) * x.cost : 0), 0);
  const excessValue = items.reduce((a, x) => a + (x.counted > x.recorded ? (x.counted - x.recorded) * x.cost : 0), 0);
  const diffLines = items.filter((x) => x.counted !== x.recorded).length;

  async function commit() {
    if (!items.length) return toast("Sanalgan mahsulot yo'q", "warn");
    try {
      await api.post("/audit", { items: items.map((x) => ({ productId: x.productId, counted: x.counted })), note });
      toast(`Inventarizatsiya yakunlandi. Farq bo'yicha ${diffLines} ta pozitsiya`, "ok");
      setCounts({}); setNote(""); setConfirming(false); load();
    } catch (e) { toast(e.message, "warn"); }
  }

  return (
    <>
      <PageHead title="Inventarizatsiya" sub="Ombordagi mahsulotlarni sanang — tizim farqni ko'rsatadi">
        {items.length > 0 && (
          <button className="btn primary" onClick={() => setConfirming(true)}>Yakunlash ({items.length})</button>
        )}
      </PageHead>

      <div className="kpis">
        <div className="card kpi teal"><div className="klabel">Sanalgan</div><div className="kval num">{items.length}<small>/{products.length}</small></div></div>
        <div className="card kpi green"><div className="klabel">Ortiqcha</div><div className="kval num">{money0(excessValue)}<small>so'm</small></div></div>
        <div className="card kpi anor"><div className="klabel">Yetmayotgan</div><div className="kval num">{money0(missingValue)}<small>so'm</small></div></div>
        <div className="card kpi gold"><div className="klabel">Farq pozitsiyalar</div><div className="kval num">{diffLines}</div></div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="search-wrap">
          <input placeholder="Nom yoki shtrix-kod bo'yicha qidiring…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <table>
          <thead><tr><th>Mahsulot</th><th className="r">Tizimda</th><th className="r">Sanalgan</th><th className="r">Farq</th><th className="r">Farq (so'm)</th></tr></thead>
          <tbody>
            {list.map((p) => {
              const raw = counts[p.id];
              const filled = raw !== "" && raw !== undefined;
              const counted = filled ? Math.max(0, Math.floor(Number(raw) || 0)) : null;
              const diff = filled ? counted - p.recorded : null;
              const money_ = filled ? diff * (p.cost || 0) : 0;
              return (
                <tr key={p.id}>
                  <td className="tname">{p.name}<div className="tbarcode">{p.barcode || "—"}</div></td>
                  <td className="r num">{p.recorded}</td>
                  <td className="r"><input className="cnt-input" type="number" min="0" value={raw ?? ""} onChange={(e) => setCounts((s) => ({ ...s, [p.id]: e.target.value }))} placeholder="—" /></td>
                  <td className="r num" style={{ color: diff == null ? "var(--ink-2)" : diff === 0 ? "var(--ok)" : diff < 0 ? "var(--anor)" : "var(--gold)" }}>{diff == null ? "—" : diff > 0 ? "+" + diff : diff}</td>
                  <td className="r num" style={{ color: money_ < 0 ? "var(--anor)" : money_ > 0 ? "var(--ok)" : "var(--ink-2)" }}>{money_ ? (money_ > 0 ? "+" : "−") + money0(Math.abs(money_)) : "—"}</td>
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan="5"><div className="empty">Mahsulot topilmadi</div></td></tr>}
          </tbody>
        </table>
      </div>

      {history.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ margin: "0 0 10px" }}>Oldingi inventarizatsiyalar</h3>
          <table>
            <thead><tr><th>Sana</th><th>Xodim</th><th className="r">Pozitsiya</th><th className="r">Ortiqcha</th><th className="r">Yetmayotgan</th></tr></thead>
            <tbody>
              {history.map((a) => (
                <tr key={a.id}>
                  <td className="num">{fmtDate(new Date(a.ts))} {fmtTime(a.ts)}</td>
                  <td>{a.userName}</td>
                  <td className="r num">{a.items.length}</td>
                  <td className="r num" style={{ color: "var(--ok)" }}>{a.excessValue ? money0(a.excessValue) : "—"}</td>
                  <td className="r num" style={{ color: "var(--anor)" }}>{a.missingValue ? money0(a.missingValue) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirming && (
        <Modal title="Inventarizatsiyani yakunlash" onClose={() => setConfirming(false)} max="440px">
          <p>Sanalgan qiymatlar tizimdagi qoldiqni almashtiradi. Bu amal ortga qaytmaydi.</p>
          <div className="kpis" style={{ margin: "12px 0" }}>
            <div className="card kpi anor"><div className="klabel">Yetmayotgan</div><div className="kval num">{money0(missingValue)}<small>so'm</small></div></div>
            <div className="card kpi green"><div className="klabel">Ortiqcha</div><div className="kval num">{money0(excessValue)}<small>so'm</small></div></div>
          </div>
          <div className="f full"><label>Izoh (ixtiyoriy)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Masalan: Oylik inventar" />
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setConfirming(false)}>Bekor</button>
            <button className="btn primary block" onClick={commit}>Tasdiqlash</button>
          </div>
        </Modal>
      )}
    </>
  );
}
