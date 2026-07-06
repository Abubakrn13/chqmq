import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { money, money0, fmtDate, fmtTime } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead } from "../components/ui.jsx";

// Human-readable descriptions for each activity type.
const TYPES = {
  "sale":              { label: "Sotuv",            color: "var(--ok)" },
  "product.create":    { label: "Mahsulot qo'shildi", color: "var(--brand)" },
  "product.update":    { label: "Mahsulot tahrirlandi", color: "var(--gold)" },
  "product.delete":    { label: "Mahsulot o'chirildi", color: "var(--anor)" },
  "return":            { label: "Qaytarish",        color: "var(--anor)" },
  "invoice":           { label: "Faktura (kirim)",  color: "var(--brand)" },
  "audit":             { label: "Inventarizatsiya", color: "var(--gold)" },
  "transfer":          { label: "Filial o'tkazma",  color: "var(--brand)" },
};

function describe(x) {
  switch (x.type) {
    case "sale":
      return `${money(x.meta.total || 0)} · ${x.meta.pay || "?"} · ${x.meta.lines || 0} pozitsiya${x.meta.discount ? ` · chegirma −${money0(x.meta.discount)}` : ""}`;
    case "product.create":
    case "product.update":
    case "product.delete":
      return x.meta.name || "";
    default:
      return "";
  }
}

export default function Activity() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [days, setDays] = useState(7);
  const [type, setType] = useState("");
  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);

  async function load() {
    try {
      const q = new URLSearchParams({ days: String(days) });
      if (type) q.set("type", type);
      if (user) q.set("user", user);
      setRows(await api.get("/activity?" + q.toString()));
    } catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days, type, user]);
  useEffect(() => { api.get("/staff").then(setUsers).catch(() => {}); }, []);

  // Group rows by day for nicer scanning.
  const grouped = useMemo(() => {
    const g = new Map();
    for (const r of rows) {
      const d = new Date(r.ts); d.setHours(0, 0, 0, 0);
      const k = d.getTime();
      if (!g.has(k)) g.set(k, []);
      g.get(k).push(r);
    }
    return [...g.entries()].sort((a, b) => b[0] - a[0]);
  }, [rows]);

  return (
    <>
      <PageHead title="Faoliyat tarixi" sub="Do'kondagi barcha muhim harakatlar" />

      <div className="card panel filters">
        <div className="cat-chips">
          {[[1, "Bugun"], [7, "7 kun"], [30, "30 kun"]].map(([n, l]) => (
            <button key={n} className={"chip" + (days === n ? " active" : "")} onClick={() => setDays(n)}>{l}</button>
          ))}
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Barcha harakatlar</option>
          {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={user} onChange={(e) => setUser(e.target.value)}>
          <option value="">Barcha xodimlar</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {!grouped.length && <div className="card"><div className="empty">Yozuvlar yo'q</div></div>}

      {grouped.map(([day, list]) => (
        <div className="card" key={day} style={{ marginTop: 14 }}>
          <h3 style={{ margin: "0 0 10px" }}>{fmtDate(new Date(day))}</h3>
          <div className="act-list">
            {list.map((r) => {
              const t = TYPES[r.type] || { label: r.type, color: "var(--ink-2)" };
              return (
                <div className="act-row" key={r.id}>
                  <div className="act-dot" style={{ background: t.color }} />
                  <div className="act-body">
                    <div className="act-head">
                      <b>{t.label}</b>
                      <span className="muted-xs">{fmtTime(r.ts)}</span>
                    </div>
                    <div className="act-desc">{describe(r)}</div>
                    <div className="act-who">{r.userName}{r.role ? ` (${r.role})` : ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
