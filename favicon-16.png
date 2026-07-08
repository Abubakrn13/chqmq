import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0, WDAYS } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Kpi } from "../components/ui.jsx";

const RANGES = [[1, "Bugun"], [7, "7 kun"], [30, "30 kun"]];

export default function Profit() {
  const toast = useToast();
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setData(await api.get("/sales/stats?days=" + days));
      } catch (e) {
        toast(e.message, "warn");
      }
    })(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const max = Math.max(1, ...(data?.daily?.map((d) => d.total) || [1]));
  const margin = data && data.revenue ? Math.round((data.profit / data.revenue) * 100) : 0;

  return (
    <>
      <PageHead title="Foyda" sub="Tushum, sof foyda va marja bo'yicha tahlil">
        <div className="cat-chips">
          {RANGES.map(([d, label]) => (
            <button key={d} className={"chip" + (d === days ? " active" : "")} onClick={() => setDays(d)}>{label}</button>
          ))}
        </div>
      </PageHead>

      {!data ? (
        <div className="empty">Yuklanmoqda…</div>
      ) : (
        <>
          <div className="kpis">
            <Kpi tone="teal" label="Tushum" value={money0(data.revenue)} unit="so'm" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></svg>} />
            <Kpi tone="green" label="Sof foyda" value={money0(data.profit)} unit="so'm" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17l6-6 4 4 8-8M21 7v5h-5" /></svg>} />
            <Kpi tone="gold" label="Marja" value={margin} unit="%" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 5 5 19M9 6.5A2.5 2.5 0 1 1 4 6.5a2.5 2.5 0 0 1 5 0ZM20 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" /></svg>} />
            <Kpi tone="anor" label="O'rtacha chek" value={money0(data.avg)} unit="so'm" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>} />
          </div>

          <div className="report-grid">
            <div className="card panel">
              <h3>Oxirgi 7 kun savdosi</h3>
              <div className="sub">Kunlik tushum, so'mda</div>
              <div className="chart">
                {data.daily.map((d, i) => (
                  <div className="bar-col" key={i}>
                    <div className="bar-wrap"><div className="bar" style={{ height: Math.max(3, Math.round((d.total / max) * 160)) + "px" }} data-v={money0(d.total)} /></div>
                    <div className="bar-day">{WDAYS[new Date(d.ts).getDay()]}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card panel">
              <h3>Eng ko'p sotilganlar</h3>
              <div className="sub">Tanlangan davr bo'yicha</div>
              <div className="toplist">
                {data.top.length ? data.top.map((t, i) => (
                  <div className="toprow" key={i}><div className="rank">{i + 1}</div><div className="tn">{t.name}</div><div className="tq">{t.qty} dona</div><div className="ts">{money0(t.sum)}</div></div>
                )) : <div className="empty">Bu davrda sotuv bo'lmagan</div>}
              </div>
            </div>
          </div>

          <div className="report-grid" style={{ marginTop: 16 }}>
            <div className="card panel">
              <h3>To'lov turlari</h3>
              <div className="sub">Tanlangan davr bo'yicha</div>
              <div className="toplist">
                {data.pays.length ? data.pays.map((p, i) => (
                  <div className="toprow" key={i}><div className="rank">{i + 1}</div><div className="tn">{p.name}</div><div className="ts">{money(p.total)}</div></div>
                )) : <div className="empty">Ma'lumot yo'q</div>}
              </div>
            </div>
            <div className="card panel">
              <h3>Kam qolgan mahsulotlar</h3>
              <div className="sub">Buyurtma berish vaqti keldi</div>
              <div className="lowlist">
                {data.low.length ? data.low.map((p) => (
                  <div className="lowitem" key={p.id}><div className="ln">{p.name}</div><div className="lq">{p.stock} dona</div></div>
                )) : <div className="empty">Hammasi yetarli</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
