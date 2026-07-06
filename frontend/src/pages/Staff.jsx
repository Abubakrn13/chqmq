import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";
import { fmtDate } from "../utils.js";

const ROLES = { owner: "Egasi", manager: "Menejer", cashier: "Sotuvchi" };
const EMPTY = { name: "", phone: "", password: "", role: "cashier" };

export default function Staff() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);

  async function load() {
    try { setRows(await api.get("/staff")); } catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function save() {
    if (!f.name.trim() || !f.phone.trim() || !f.password.trim()) return toast("Ism, login va parolni kiriting", "warn");
    try {
      await api.post("/staff", f);
      toast("Xodim qo'shildi", "ok");
      setOpen(false); setF(EMPTY); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  async function remove(u) {
    if (u.role === "owner") return;
    if (!confirm(`"${u.name}" o'chirilsinmi?`)) return;
    try { await api.del("/staff/" + u.id); load(); } catch (e) { toast(e.message, "warn"); }
  }
  async function reset(u) {
    const pw = prompt(`${u.name} uchun yangi parol:`);
    if (!pw || pw.length < 4) return;
    try { await api.put("/staff/" + u.id, { password: pw }); toast("Parol yangilandi", "ok"); } catch (e) { toast(e.message, "warn"); }
  }

  return (
    <>
      <PageHead title="Xodimlar" sub="Do'kon xodimlari (menejer va sotuvchi)">
        <button className="btn primary" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Xodim qo'shish
        </button>
      </PageHead>

      <div className="card">
        <table>
          <thead><tr><th>Ism</th><th>Login</th><th>Rol</th><th>Qo'shilgan</th><th className="r"></th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="tname">{u.name}</td>
                <td className="num">{u.phone}</td>
                <td><span className="cat-tag">{ROLES[u.role]}</span></td>
                <td className="num">{fmtDate(new Date(u.createdAt))}</td>
                <td className="r">
                  <div className="rowact">
                    <button className="btn sm" onClick={() => reset(u)}>Parol</button>
                    {u.role !== "owner" && (
                      <button className="iconbtn del" onClick={() => remove(u)} title="O'chirish">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Yangi xodim" onClose={() => setOpen(false)} max="440px">
          <div className="f full"><label>Ism</label><input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="fgrid">
            <div className="f"><label>Login (telefon)</label><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="998 90 ..." /></div>
            <div className="f"><label>Parol</label><input value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="kamida 4 belgi" /></div>
            <div className="f full"><label>Rol</label>
              <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
                <option value="cashier">Sotuvchi — faqat kassa</option>
                <option value="manager">Menejer — hamma narsani ko'radi va boshqaradi</option>
              </select>
            </div>
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
