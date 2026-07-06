import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0 } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

// Simple monthly/daily sales targets per cashier — with progress bars.
// Cashiers can see their own row too, so they know where they stand.
const ROLES = { owner: "Egasi", manager: "Menejer", cashier: "Sotuvchi" };

export default function Targets() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [edit, setEdit] = useState(null);
  const [f, setF] = useState({ daily: "", monthly: "" });

  async function load() {
    try { setRows(await api.get("/targets")); }
    catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); }, []);

  function openEdit(row) {
    setEdit(row);
    setF({ daily: row.target.daily || "", monthly: row.target.monthly || "" });
  }
  async function save() {
    try {
      await api.put("/targets/" + edit.userId, {
        daily: Number(f.daily) || 0,
        monthly: Number(f.monthly) || 0,
      });
      toast("Maqsad saqlandi", "ok");
      setEdit(null); load();
    } catch (e) { toast(e.message, "warn"); }
  }

  return (
    <>
      <PageHead title="Xodim maqsadlari" sub="Kunlik va oylik sotuv rejasi — motivatsiya uchun" />

      <div className="target-grid">
        {rows.map((r) => (
          <div className="card target-card" key={r.userId}>
            <div className="tg-head">
              <div>
                <div className="tg-name">{r.userName}</div>
                <div className="muted-xs">{ROLES[r.role]}</div>
              </div>
              <button className="btn ghost sm" onClick={() => openEdit(r)}>Tahrir</button>
            </div>

            {r.target.daily > 0 || r.target.monthly > 0 ? (
              <>
                {r.target.daily > 0 && (
                  <div className="tg-line">
                    <div className="tg-lbl">
                      <span>Bugun</span>
                      <span><b>{money0(r.progress.today)}</b> / {money0(r.target.daily)}</span>
                    </div>
                    <div className="tg-bar">
                      <div className={"tg-fill " + (r.progress.dailyPct >= 100 ? "done" : "")} style={{ width: r.progress.dailyPct + "%" }} />
                    </div>
                    <div className="tg-pct">{r.progress.dailyPct}%</div>
                  </div>
                )}
                {r.target.monthly > 0 && (
                  <div className="tg-line">
                    <div className="tg-lbl">
                      <span>Bu oy</span>
                      <span><b>{money0(r.progress.month)}</b> / {money0(r.target.monthly)}</span>
                    </div>
                    <div className="tg-bar">
                      <div className={"tg-fill " + (r.progress.monthlyPct >= 100 ? "done" : "")} style={{ width: r.progress.monthlyPct + "%" }} />
                    </div>
                    <div className="tg-pct">{r.progress.monthlyPct}%</div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty" style={{ padding: 20 }}>
                <div className="muted-xs">Maqsad belgilanmagan</div>
                <div className="muted-xs" style={{ marginTop: 4 }}>Bu oy sotgan: <b>{money0(r.progress.month)}</b></div>
              </div>
            )}
          </div>
        ))}
        {!rows.length && <div className="empty" style={{ gridColumn: "1 / -1" }}>Xodimlar yo'q</div>}
      </div>

      {edit && (
        <Modal title={`Maqsad · ${edit.userName}`} onClose={() => setEdit(null)} max="400px">
          <div className="f full"><label>Kunlik maqsad (so'm)</label>
            <input type="number" min="0" autoFocus value={f.daily} onChange={(e) => setF({ ...f, daily: e.target.value })} placeholder="Masalan: 500 000" />
          </div>
          <div className="f full"><label>Oylik maqsad (so'm)</label>
            <input type="number" min="0" value={f.monthly} onChange={(e) => setF({ ...f, monthly: e.target.value })} placeholder="Masalan: 12 000 000" />
          </div>
          <p className="modal-note">0 kiritsangiz, maqsad olib tashlanadi.</p>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setEdit(null)}>Bekor</button>
            <button className="btn primary block" onClick={save}>Saqlash</button>
          </div>
        </Modal>
      )}
    </>
  );
}
