import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0 } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

const EMPTY = { name: "", phone: "", note: "" };

export default function Suppliers() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [f, setF] = useState(EMPTY);

  async function load() {
    try {
      setRows(await api.get("/suppliers"));
      try { setAnalytics(await api.get("/supplier-analytics?days=90")); } catch {}
    } catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function openNew() { setEditing(null); setF(EMPTY); setOpen(true); }
  function openEdit(s) { setEditing(s); setF({ name: s.name, phone: s.phone, note: s.note }); setOpen(true); }
  async function save() {
    if (!f.name.trim()) return toast("Nomi majburiy", "warn");
    try {
      if (editing) await api.put("/suppliers/" + editing.id, f);
      else await api.post("/suppliers", f);
      toast("Saqlandi", "ok"); setOpen(false); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  async function remove(s) {
    if (!confirm(`"${s.name}" o'chirilsinmi?`)) return;
    try { await api.del("/suppliers/" + s.id); load(); } catch (e) { toast(e.message, "warn"); }
  }

  return (
    <>
      <PageHead title="Yetkazib beruvchilar" sub="Tovar keladigan manbalar">
        <button className="btn primary" onClick={openNew}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Qo'shish
        </button>
      </PageHead>

      {analytics && analytics.suppliers.length > 0 && (
        <>
          <div className="kpis">
            <div className="card kpi teal"><div className="klabel">Xarid (90 kun)</div><div className="kval num">{money0(analytics.totals.spent)}<small>so'm</small></div></div>
            <div className="card kpi green"><div className="klabel">Ular tovaridan tushum</div><div className="kval num">{money0(analytics.totals.revenue)}<small>so'm</small></div></div>
            <div className="card kpi gold"><div className="klabel">Ular tovaridan foyda</div><div className="kval num">{money0(analytics.totals.profit)}<small>so'm</small></div></div>
            <div className="card kpi anor"><div className="klabel">Faol yetkazib beruvchi</div><div className="kval num">{analytics.suppliers.filter((s) => s.spent > 0).length}<small>/ {analytics.suppliers.length}</small></div></div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 10px" }}>Yetkazib beruvchi tahlili (oxirgi 90 kun)</h3>
            <table>
              <thead><tr><th>Nomi</th><th className="r">Mahsulot</th><th className="r">Xarid</th><th className="r">Tushum</th><th className="r">Foyda</th><th className="r">Foyda %</th></tr></thead>
              <tbody>
                {analytics.suppliers.map((s) => {
                  const margin = s.revenue ? Math.round(s.profit / s.revenue * 100) : 0;
                  return (
                    <tr key={s.id}>
                      <td className="tname">{s.name}<div className="tbarcode">{s.phone || "—"}</div></td>
                      <td className="r num">{s.productCount}</td>
                      <td className="r num">{money0(s.spent)}</td>
                      <td className="r num">{money0(s.revenue)}</td>
                      <td className="r num" style={{ color: s.profit > 0 ? "var(--ok)" : "var(--anor)" }}><b>{money0(s.profit)}</b></td>
                      <td className="r num" style={{ color: margin >= 20 ? "var(--ok)" : margin >= 5 ? "var(--gold)" : "var(--anor)" }}>{margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="card">
        <table>
          <thead><tr><th>Nomi</th><th>Telefon</th><th>Izoh</th><th className="r"></th></tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="tname">{s.name}</td>
                <td className="num">{s.phone || "—"}</td>
                <td className="muted-xs">{s.note || "—"}</td>
                <td className="r">
                  <div className="rowact">
                    <button className="iconbtn" onClick={() => openEdit(s)} title="Tahrir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg></button>
                    <button className="iconbtn del" onClick={() => remove(s)} title="O'chirish"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="4"><div className="empty">Yetkazib beruvchilar yo'q</div></td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? "Tahrirlash" : "Yangi yetkazib beruvchi"} onClose={() => setOpen(false)} max="420px">
          <div className="f full"><label>Nomi</label><input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Masalan: Uzum Savdo" /></div>
          <div className="f full"><label>Telefon</label><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div className="f full"><label>Izoh</label><input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setOpen(false)}>Bekor</button>
            <button className="btn primary block" onClick={save}>Saqlash</button>
          </div>
        </Modal>
      )}
    </>
  );
}
