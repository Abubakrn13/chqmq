import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0, fmtDate, fmtTime } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead } from "../components/ui.jsx";

// Owner-visible flags for sales/staff patterns worth reviewing.
export default function Suspicious() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [tag, setTag] = useState("");

  async function load() {
    try { setData(await api.get(`/suspicious?days=${days}`)); }
    catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  const flags = data?.flags?.filter((f) => !tag || f.tag === tag) || [];
  const tags = [
    ["", "Barchasi"],
    ["discount", "Katta chegirma"],
    ["hours", "Kutilmagan vaqt"],
    ["large", "Katta chek"],
    ["returns", "Ko'p qaytarish"],
  ];

  return (
    <>
      <PageHead title="Shubhali sotuvlar" sub="Tekshirib chiqishga arziydigan sotuv va harakatlar" />

      {data && (
        <div className="kpis">
          <div className="card kpi anor"><div className="klabel">Yuqori</div><div className="kval num">{data.counts.high}</div></div>
          <div className="card kpi gold"><div className="klabel">O'rtacha</div><div className="kval num">{data.counts.med}</div></div>
          <div className="card kpi teal"><div className="klabel">Jami</div><div className="kval num">{data.counts.total}</div></div>
          <div className="card kpi green"><div className="klabel">Odatdagi chek</div><div className="kval num">{money0(data.baseline.medianReceipt)}<small>so'm</small></div></div>
        </div>
      )}

      <div className="card panel filters">
        <div className="cat-chips">
          {[[7, "7 kun"], [30, "30 kun"], [90, "90 kun"]].map(([n, l]) => (
            <button key={n} className={"chip" + (days === n ? " active" : "")} onClick={() => setDays(n)}>{l}</button>
          ))}
        </div>
        <div className="cat-chips">
          {tags.map(([v, l]) => (
            <button key={v} className={"chip" + (tag === v ? " active" : "")} onClick={() => setTag(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        {!flags.length ? (
          <div className="empty" style={{ padding: 40 }}>
            <div style={{ fontSize: 46, marginBottom: 8 }}>✓</div>
            <div>Hech qanday shubhali harakat yo'q</div>
          </div>
        ) : (
          <div className="act-list">
            {flags.map((f, i) => (
              <div className="act-row" key={i}>
                <div className="act-dot" style={{ background: f.severity === "high" ? "var(--anor)" : "var(--gold)" }} />
                <div className="act-body">
                  <div className="act-head">
                    <b>{f.userName || "?"}</b>
                    {f.ts && <span className="muted-xs">{fmtDate(new Date(f.ts))} {fmtTime(f.ts)}</span>}
                  </div>
                  <div className="act-desc">{f.reason}</div>
                  {f.total != null && <div className="act-who">Chek summasi: {money(f.total)}{f.discount ? ` · chegirma −${money0(f.discount)}` : ""}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card panel info-band" style={{ marginTop: 12 }}>
        <b>ℹ Bu ayblov emas</b>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>
          Tizim shunchaki ko'zga tashlanishi kerak bo'lgan naqshlarni ko'rsatadi. Har bir belgini o'zingiz tekshirib, xato borligi yoki yo'qligini o'zingiz qaror qiling.
        </p>
      </div>
    </>
  );
}
