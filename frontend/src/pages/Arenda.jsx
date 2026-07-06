import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0, fmtDate } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

const CATS = ["Arenda", "Kommunal", "Ish haqi", "Boshqa"];
const EMPTY = { title: "", amount: "", category: "Arenda", dueDate: "", note: "" };

export default function Arenda() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);

  async function load() {
    try {
      setRows(await api.get("/expenses"));
    } catch (e) {
      toast(e.message, "warn");
    }
  }
  useEffect(() => {
    load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalMonth = rows.reduce((a, r) => a + r.amount, 0);
  const unpaid = rows.filter((r) => !r.paid).reduce((a, r) => a + r.amount, 0);

  async function save() {
    if (!f.title.trim() || !Number(f.amount)) return toast("Nom va summani kiriting", "warn");
    try {
      await api.post("/expenses", {
        title: f.title,
        amount: Number(f.amount),
        category: f.category,
        note: f.note,
        dueDate: f.dueDate ? new Date(f.dueDate).getTime() : null,
      });
      toast("Xarajat qo'shildi", "ok");
      setOpen(false);
      setF(EMPTY);
      load();
    } catch (e) {
      toast(e.message, "warn");
    }
  }
  async function togglePaid(r) {
    try {
      await api.put("/expenses/" + r.id, { paid: !r.paid });
      load();
    } catch (e) {
      toast(e.message, "warn");
    }
  }
  async function remove(r) {
    if (!confirm(`"${r.title}" o'chirilsinmi?`)) return;
    try {
      await api.del("/expenses/" + r.id);
      load();
    } catch (e) {
      toast(e.message, "warn");
    }
  }

  return (
    <>
      <PageHead title="Arenda va xarajatlar" sub={`Jami ${money0(totalMonth)} so'm · to'lanmagan ${money0(unpaid)} so'm`}>
        <button className="btn primary" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Xarajat qo'shish
        </button>
      </PageHead>

      {!rows.length ? (
        <div className="card"><div className="empty">Hozircha xarajatlar kiritilmagan</div></div>
      ) : (
        <div className="card">
          <table>
            <thead><tr><th>Nomi</th><th>Turi</th><th>Muddat</th><th className="r">Summa</th><th>Holat</th><th className="r"></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="tname">{r.title}</td>
                  <td><span className="cat-tag">{r.category}</span></td>
                  <td className="num">{r.dueDate ? fmtDate(new Date(r.dueDate)) : "—"}</td>
                  <td className="r num"><b>{money(r.amount)}</b></td>
                  <td>{r.paid ? <span className="pill ok">To'langan</span> : <span className="pill low">Kutilmoqda</span>}</td>
                  <td className="r">
                    <div className="rowact">
                      <button className="btn sm" onClick={() => togglePaid(r)}>{r.paid ? "Bekor" : "To'landi"}</button>
                      <button className="iconbtn del" title="O'chirish" onClick={() => remove(r)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="Yangi xarajat" onClose={() => setOpen(false)} max="440px">
          <div className="f full"><label>Nomi</label><input autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Masalan: Do'kon ijarasi" /></div>
          <div className="fgrid">
            <div className="f"><label>Summa (so'm)</label><input type="number" min="0" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
            <div className="f"><label>Turi</label><select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="f full"><label>To'lov muddati (ixtiyoriy)</label><input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></div>
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setOpen(false)}>Bekor</button>
            <button className="btn primary block" onClick={save}>Saqlash</button>
          </div>
        </Modal>
      )}
    </>
  );
}
