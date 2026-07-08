import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0 } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

const EMPTY = { name: "", address: "", managerName: "", managerPhone: "", managerPassword: "" };

export default function BranchControl() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState(null);
  const [f, setF] = useState(EMPTY);

  async function load() { try { setRows(await api.get("/branches")); } catch (e) { toast(e.message, "warn"); } }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function openNew() { setCreated(null); setF(EMPTY); setOpen(true); }
  async function save() {
    if (!f.name.trim()) return toast("Filial nomi majburiy", "warn");
    // If any manager field is filled, all three must be filled.
    const wantsManager = f.managerPhone.trim() || f.managerPassword.trim();
    if (wantsManager && (!f.managerPhone.trim() || !f.managerPassword.trim()))
      return toast("Menejer uchun login va parolni ikkalasini kiriting", "warn");
    try {
      const b = await api.post("/branches", f);
      if (b.manager) setCreated({ shop: b.name, phone: b.manager.phone, password: f.managerPassword });
      else { setOpen(false); }
      toast("Filial qo'shildi", "ok"); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  async function remove(b) {
    if (!confirm(`"${b.name}" filiali o'chirilsinmi?`)) return;
    try { await api.del("/branches/" + b.id); toast("O'chirildi", "ok"); load(); }
    catch (e) { toast(e.message, "warn"); }
  }

  const total = rows.reduce((a, r) => a + r.revenue, 0);
  const bestId = rows.length > 1 ? rows.slice().sort((a, b) => b.revenue - a.revenue)[0].id : null;

  return (
    <>
      <PageHead title="Filiallar" sub={`${rows.length} ta filial · 30 kunlik tushum ${money0(total)} so'm`}>
        <button className="btn primary" onClick={openNew}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Filial qo'shish
        </button>
      </PageHead>

      <div className="branch-grid">
        {rows.map((b) => (
          <div className={"card branch-card" + (b.id === bestId ? " best" : "")} key={b.id}>
            <div className="branch-head">
              <div>
                <div className="branch-name">{b.name}</div>
                {b.address && <div className="branch-addr">{b.address}</div>}
              </div>
              {b.id === bestId && <span className="pill ok">Yetakchi</span>}
            </div>
            <div className="branch-kpis">
              <div><span>Tushum</span><b>{money(b.revenue)}</b></div>
              <div><span>Foyda</span><b>{money(b.profit)}</b></div>
              <div><span>Sotuvlar</span><b>{b.count}</b></div>
            </div>
            <div className="branch-foot">
              <span className="muted-xs">Har filial alohida logini bilan alohida ishlaydi</span>
              <button className="iconbtn del" onClick={() => remove(b)} title="O'chirish">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
              </button>
            </div>
          </div>
        ))}
        {!rows.length && <div className="empty" style={{ gridColumn: "1 / -1" }}>Filial yo'q</div>}
      </div>

      {open && (
        <Modal title={created ? "Filial va login tayyor" : "Yangi filial"} onClose={() => setOpen(false)} max="470px">
          {created ? (
            <div className="cred-done">
              <div className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg></div>
              <h3>Filial menejeri hisobi tayyor</h3>
              <p className="modal-note">Ushbu ma'lumotlarni menejerga bering. U kirgach faqat shu filial ma'lumotlarini ko'radi.</p>
              <div className="cred-box">
                <div><span>Filial</span><b>{created.shop}</b></div>
                <div><span>Login</span><b>{created.phone}</b></div>
                <div><span>Parol</span><b>{created.password}</b></div>
              </div>
              <div className="modal-foot">
                <button className="btn primary block" onClick={() => setOpen(false)}>Yopish</button>
              </div>
            </div>
          ) : (
            <>
              <div className="f full"><label>Filial nomi</label>
                <input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Chilonzor filiali" />
              </div>
              <div className="f full"><label>Manzil</label>
                <input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Toshkent, Chilonzor tumani…" />
              </div>
              <div className="branch-manager-block">
                <div className="bm-title">Filial uchun login (menejer)</div>
                <div className="bm-hint">Bo'sh qoldirsangiz, filial ochiladi lekin unga alohida kirish yaratilmaydi. To'ldirsangiz — ushbu menejer faqat shu filialning ma'lumotlarini ko'radi va boshqaradi.</div>
                <div className="fgrid" style={{ marginTop: 10 }}>
                  <div className="f"><label>Menejer ismi</label>
                    <input value={f.managerName} onChange={(e) => setF({ ...f, managerName: e.target.value })} placeholder="Bek" />
                  </div>
                  <div className="f"><label>Login (telefon)</label>
                    <input value={f.managerPhone} onChange={(e) => setF({ ...f, managerPhone: e.target.value })} placeholder="998 90 ..." />
                  </div>
                  <div className="f full"><label>Parol</label>
                    <input value={f.managerPassword} onChange={(e) => setF({ ...f, managerPassword: e.target.value })} placeholder="kamida 4 belgi" />
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button className="btn ghost" onClick={() => setOpen(false)}>Bekor</button>
                <button className="btn primary block" onClick={save}>Yaratish</button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
