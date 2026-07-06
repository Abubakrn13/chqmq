import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0 } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Kpi } from "../components/ui.jsx";

const RANGES = [[7, "7 kun"], [30, "30 kun"], [90, "90 kun"]];

export default function Performance() {
  const toast = useToast();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try { setData(await api.get("/performance?days=" + days)); }
      catch (e) { toast(e.message, "warn"); }
    })(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <>
      <PageHead title="Xodim samaradorligi" sub="Kim ko'p ishladi va oylik qanday taqsimlansa yaxshi bo'ladi">
        <div className="cat-chips">
          {RANGES.map(([d, label]) => (
            <button key={d} className={"chip" + (d === days ? " active" : "")} onClick={() => setDays(d)}>{label}</button>
          ))}
        </div>
      </PageHead>

      {!data ? <div className="empty">Yuklanmoqda…</div> : (
        <>
          <div className="kpis">
            <Kpi tone="teal" label="Oylik byudjet taxmini" value={money0(data.payBudget)} unit="so'm" />
            <Kpi tone="green" label="Umumiy tushum" value={money0(data.rows.reduce((a, r) => a + r.revenue, 0))} unit="so'm" />
            <Kpi tone="gold" label="Xodimlar" value={data.rows.filter((r) => r.role !== "owner").length} unit="ta" />
            <Kpi tone="anor" label="Umumiy sotuvlar" value={data.rows.reduce((a, r) => a + r.salesCount, 0)} unit="ta" />
          </div>

          <div className="card ai-tip" style={{ marginTop: 16 }}>
            <div className="ai-tip-head">
              <div className="ai-orb sm">💡</div>
              <div><b>AI xulosasi</b><span>Xodimlar bo'yicha taqqoslash</span></div>
            </div>
            <div className="ai-tip-body">{data.insight}</div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <table>
              <thead><tr><th>Xodim</th><th>Rol</th><th className="r">Sotuvlar</th><th className="r">Tushum</th><th className="r">Foyda</th><th className="r">Soatlar</th><th className="r">Ulush</th><th className="r">Taxminiy oylik</th></tr></thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id}>
                    <td className="tname">{r.name}</td>
                    <td><span className="cat-tag">{r.role === "owner" ? "Egasi" : r.role === "manager" ? "Menejer" : "Sotuvchi"}</span></td>
                    <td className="r num">{r.salesCount}</td>
                    <td className="r num">{money0(r.revenue)}</td>
                    <td className="r num">{money0(r.profit)}</td>
                    <td className="r num">{r.hours}</td>
                    <td className="r num">{r.share != null ? r.share + "%" : "—"}</td>
                    <td className="r num"><b>{r.suggestedPay != null ? money(r.suggestedPay) : "—"}</b></td>
                  </tr>
                ))}
                {!data.rows.length && <tr><td colSpan="8"><div className="empty">Xodimlar yo'q</div></td></tr>}
              </tbody>
            </table>
          </div>

          <p className="modal-note" style={{ marginTop: 12 }}>
            Byudjet — 30 kunlik tushumning 15% (minimum 3 mln so'm). Ulush — har xodimning tushumi, ishlagan soatlari va kunlari asosida. Bu <b>taxminiy taqsimot</b> — o'zingiz yakuniy qarorni qabul qilasiz.
          </p>
        </>
      )}
    </>
  );
}
