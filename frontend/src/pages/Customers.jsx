import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { money0 } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

const EMPTY = { name: "", phone: "", note: "" };

export default function Customers() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [f, setF] = useState(EMPTY);

  async function load() {
    try {
      setList(await api.get("/customers"));
    } catch (e) {
      toast(e.message, "warn");
    }
  }
  useEffect(() => {
    load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter((c) => !q || c.name.toLowerCase().includes(q) || (c.phone || "").includes(q));
  }, [list, search]);
  const totalDebt = list.reduce((a, c) => a + c.debt, 0);

  function open(c) {
    setEditing(c || null);
    setF(c ? { name: c.name, phone: c.phone, note: c.note } : EMPTY);
  }
  async function save() {
    if (!f.name.trim()) return toast("Ism majburiy", "warn");
    try {
      if (editing) await api.put("/customers/" + editing.id, f);
      else await api.post("/customers", f);
      toast(editing ? "Yangilandi" : "Mijoz qo'shildi", "ok");
      setEditing(undefined);
      load();
    } catch (e) {
      toast(e.message, "warn");
    }
  }
  async function remove(c) {
    if (!confirm(`"${c.name}" o'chirilsinmi?`)) return;
    try {
      await api.del("/customers/" + c.id);
      load();
    } catch (e) {
      toast(e.message, "warn");
    }
  }

  return (
    <>
      <PageHead title="Mijozlar" sub={`${list.length} ta mijoz · umumiy qarz ${money0(totalDebt)} so'm`}>
        <button className="btn primary" onClick={() => open(null)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Mijoz qo'shish
        </button>
      </PageHead>

      <div className="toolbar">
        <div className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
          <input placeholder="Ism yoki telefon bo'yicha…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Mijoz</th><th>Telefon</th><th>Izoh</th><th className="r">Qarz</th><th className="r"></th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td><div className="tname">{c.name}</div></td>
                <td className="num">{c.phone || "—"}</td>
                <td className="muted-xs">{c.note || "—"}</td>
                <td className="r num">{c.debt > 0 ? <b style={{ color: "var(--anor)" }}>{money0(c.debt)}</b> : <span style={{ color: "var(--ink-2)" }}>0</span>}</td>
                <td className="r">
                  <div className="rowact">
                    <button className="iconbtn" title="Tahrirlash" onClick={() => open(c)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg></button>
                    <button className="iconbtn del" title="O'chirish" onClick={() => remove(c)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="5"><div className="empty">Mijoz topilmadi</div></td></tr>}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <Modal title={editing ? "Mijozni tahrirlash" : "Yangi mijoz"} onClose={() => setEditing(undefined)} max="420px">
          <div className="f full"><label>Ism</label><input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Mijoz ismi" /></div>
          <div className="f full"><label>Telefon</label><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="998 90 ..." /></div>
          <div className="f full"><label>Izoh</label><input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Ixtiyoriy" /></div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setEditing(undefined)}>Bekor</button>
            <button className="btn primary block" onClick={save}>Saqlash</button>
          </div>
        </Modal>
      )}
    </>
  );
}
