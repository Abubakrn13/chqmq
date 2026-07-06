import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { money, money0, WDAYS, fmtTime } from "../utils.js";
import { useToast } from "../toast.jsx";
import { useAuth } from "../auth.jsx";
import { PageHead, Kpi } from "../components/ui.jsx";
import LiveFeed from "../components/LiveFeed.jsx";

export default function Dashboard() {
  const toast = useToast();
  const { shop, user } = useAuth();
  const [d, setD] = useState(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.post("/ai/chat", { messages: [{ role: "user", content: "Bugungi eng muhim tavsiyalarni qisqa ayt" }] });
        setTip(r.reply);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setD(await api.get("/sales/summary"));
      } catch (e) {
        toast(e.message, "warn");
      }
    })(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!d) return (<><PageHead title="Boshqaruv paneli" /><div className="empty">Yuklanmoqda…</div></>);
  const max = Math.max(1, ...d.daily.map((x) => x.total));

  return (
    <>
      <PageHead title={`Assalomu alaykum${shop?.name ? ", " + shop.name : ""}`} sub="Do'koningizning bugungi holati">
        <Link to="/panel/sell" className="btn primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Yangi sotuv
        </Link>
      </PageHead>

      <div className="kpis">
        <Kpi tone="teal" label="Bugungi tushum" value={money0(d.today.revenue)} unit="so'm" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></svg>} />
        <Kpi tone="green" label="Bugungi foyda" value={money0(d.today.profit)} unit="so'm" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17l6-6 4 4 8-8M21 7v5h-5" /></svg>} />
        <Kpi tone="gold" label="Bugungi sotuvlar" value={d.today.count} unit="ta" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1-2-1Z" /><path d="M8 8h8M8 12h8" /></svg>} />
        <Kpi tone="anor" label="Umumiy qarz" value={money0(d.debtsOutstanding)} unit="so'm" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M2 10h20" /></svg>} />
      </div>

      <div className="report-grid">
        <div className="card panel">
          <h3>Oxirgi 7 kun</h3>
          <div className="sub">Kunlik tushum, so'mda</div>
          <div className="chart">
            {d.daily.map((x, i) => (
              <div className="bar-col" key={i}>
                <div className="bar-wrap"><div className="bar" style={{ height: Math.max(3, Math.round((x.total / max) * 160)) + "px" }} data-v={money0(x.total)} /></div>
                <div className="bar-day">{WDAYS[new Date(x.ts).getDay()]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card panel">
          <h3>Oxirgi sotuvlar</h3>
          <div className="sub">So'nggi cheklar</div>
          <div className="toplist">
            {d.recent.length ? d.recent.map((s) => (
              <div className="toprow" key={s.id}>
                <div className="rank">#{s.id.slice(0, 3).toUpperCase()}</div>
                <div className="tn">{s.customerName || s.pay}<div className="muted-xs">{fmtTime(s.ts)}</div></div>
                <div className="ts">{money0(s.total)}</div>
              </div>
            )) : <div className="empty">Hali sotuv yo'q</div>}
          </div>
        </div>
      </div>

      {tip && (
        <Link to="/panel/ai" className="card ai-tip">
          <div className="ai-tip-head">
            <div className="ai-orb sm">✨</div>
            <div>
              <b>AI yordamchi tavsiyasi</b>
              <span>Do'koningiz ma'lumotlari asosida</span>
            </div>
            <span className="ai-tip-more">Batafsil →</span>
          </div>
          <div className="ai-tip-body">{tip}</div>
        </Link>
      )}

      {(shop && (shop.subscription?.status === "active")) && ["owner", "manager"].includes(user?.role) && (
        <div style={{ marginTop: 16 }}>
          <LiveFeed />
        </div>
      )}

      <div className="mini-grid">
        <Link to="/panel/products" className="mini card">
          <span className="mini-label">Kam qoldiq</span>
          <span className="mini-val num">{d.lowStock} <small>ta</small></span>
        </Link>
        <Link to="/panel/customers" className="mini card">
          <span className="mini-label">Mijozlar</span>
          <span className="mini-val num">{d.customers} <small>ta</small></span>
        </Link>
        <Link to="/panel/profit" className="mini card">
          <span className="mini-label">30 kun foyda</span>
          <span className="mini-val num">{money0(d.month.profit)}</span>
        </Link>
        <Link to="/panel/return" className="mini card">
          <span className="mini-label">30 kun qaytarish</span>
          <span className="mini-val num">{money0(d.month.returns)}</span>
        </Link>
      </div>
    </>
  );
}
