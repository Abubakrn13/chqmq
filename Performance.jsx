import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0, fmtDate, fmtTime } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

export default function Shifts() {
  const toast = useToast();
  const [cur, setCur] = useState(null);
  const [past, setPast] = useState([]);
  const [openOpen, setOpenOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [cash, setCash] = useState("");

  async function load() {
    try {
      setCur(await api.get("/shifts/current"));
      setPast(await api.get("/shifts"));
    } catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function openShift() {
    try {
      await api.post("/shifts/open", { openCash: Number(cash) || 0 });
      toast("Smena ochildi", "ok");
      setOpenOpen(false); setCash(""); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  async function closeShift() {
    try {
      const r = await api.post("/shifts/close", { closeCash: Number(cash) || 0 });
      const msg = r.diff === 0 ? "Kelishdi ✓" : r.diff > 0 ? `Ortiqcha: ${money(r.diff)}` : `Kam: ${money(Math.abs(r.diff))}`;
      toast("Smena yopildi · " + msg, r.diff === 0 ? "ok" : "warn");
      setCloseOpen(false); setCash(""); load();
    } catch (e) { toast(e.message, "warn"); }
  }

  return (
    <>
      <PageHead title="Kassa smenasi" sub="Kun boshida ochib, oxirida yoping — naqd farqi tekshiriladi" />

      {cur ? (
        <div className="card panel">
          <h3>Ochiq smena</h3>
          <div className="sub">Boshlangan: {fmtTime(cur.openedAt)}, {fmtDate(new Date(cur.openedAt))}</div>
          <div className="kpis" style={{ marginTop: 14 }}>
            <div className="card kpi teal"><div className="klabel">Boshlanish naqd</div><div className="kval num">{money0(cur.openCash)}</div></div>
            <div className="card kpi green"><div className="klabel">Naqd sotuvlar</div><div className="kval num">+{money0(cur.salesSum)}</div></div>
            <div className="card kpi anor"><div className="klabel">Qaytarish + xarajat</div><div className="kval num">−{money0(cur.returnSum + cur.expenseSum)}</div></div>
            <div className="card kpi gold"><div className="klabel">Kutilayotgan naqd</div><div className="kval num">{money0(cur.expected)}</div></div>
          </div>
          <button className="btn primary lg" style={{ marginTop: 14 }} onClick={() => { setCash(String(cur.expected)); setCloseOpen(true); }}>Smenani yopish</button>
        </div>
      ) : (
        <div className="card panel">
          <h3>Ochiq smena yo'q</h3>
          <div className="sub">Kun boshida yangi smena oching</div>
          <button className="btn primary lg" style={{ marginTop: 12 }} onClick={() => setOpenOpen(true)}>Smena ochish</button>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <table>
          <thead><tr><th>Xodim</th><th>Ochilgan</th><th>Yopilgan</th><th className="r">Naqd sotuv</th><th className="r">Ochilishi</th><th className="r">Yopilishi</th><th className="r">Farqi</th></tr></thead>
          <tbody>
            {past.map((s) => (
              <tr key={s.id}>
                <td className="tname">{s.userName}</td>
                <td className="num">{fmtDate(new Date(s.openedAt))} {fmtTime(s.openedAt)}</td>
                <td className="num">{fmtTime(s.closedAt)}</td>
                <td className="r num">{money0(s.salesSum)}</td>
                <td className="r num">{money0(s.openCash)}</td>
                <td className="r num">{money0(s.closeCash)}</td>
                <td className="r num" style={{ color: s.diff === 0 ? "var(--ok)" : "var(--anor)" }}><b>{s.diff >= 0 ? "+" : "−"}{money0(Math.abs(s.diff))}</b></td>
              </tr>
            ))}
            {!past.length && <tr><td colSpan="7"><div className="empty">Yopilgan smenalar yo'q</div></td></tr>}
          </tbody>
        </table>
      </div>

      {openOpen && (
        <Modal title="Smenani ochish" onClose={() => setOpenOpen(false)} max="380px">
          <div className="f full"><label>Kassadagi boshlang'ich naqd</label>
            <input type="number" min="0" autoFocus value={cash} onChange={(e) => setCash(e.target.value)} onKeyDown={(e) => e.key === "Enter" && openShift()} />
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setOpenOpen(false)}>Bekor</button>
            <button className="btn primary block" onClick={openShift}>Ochish</button>
          </div>
        </Modal>
      )}
      {closeOpen && (
        <Modal title="Smenani yopish" onClose={() => setCloseOpen(false)} max="380px">
          <p className="modal-note">Kassadagi haqiqiy naqdni sanang va yozing. Farqi ko'rsatiladi.</p>
          <div className="f full"><label>Kassadagi haqiqiy naqd</label>
            <input type="number" min="0" autoFocus value={cash} onChange={(e) => setCash(e.target.value)} onKeyDown={(e) => e.key === "Enter" && closeShift()} />
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setCloseOpen(false)}>Bekor</button>
            <button className="btn primary block" onClick={closeShift}>Yopish</button>
          </div>
        </Modal>
      )}
    </>
  );
}
