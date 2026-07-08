import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0, fmtTime } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead } from "../components/ui.jsx";

export default function TodaySales() {
  const toast = useToast();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setRows(await api.get("/sales/today"));
      } catch (e) {
        toast(e.message, "warn");
      }
    })(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = (rows || []).reduce((a, s) => a + s.total, 0);
  const profit = (rows || []).reduce((a, s) => a + s.profit, 0);

  return (
    <>
      <PageHead title="Bugungi sotuvlar" sub={rows ? `${rows.length} ta chek · ${money0(total)} so'm tushum · ${money0(profit)} so'm foyda` : ""} />
      {!rows ? (
        <div className="empty">Yuklanmoqda…</div>
      ) : !rows.length ? (
        <div className="card"><div className="empty">Bugun hali sotuv bo'lmagan</div></div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr><th>Vaqt</th><th>Chek</th><th>Mahsulotlar</th><th>To'lov</th><th className="r">Foyda</th><th className="r">Summa</th></tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="num">{fmtTime(s.ts)}</td>
                  <td className="tbarcode">#{s.id.slice(0, 8).toUpperCase()}</td>
                  <td>
                    {s.items.slice(0, 2).map((it) => it.name).join(", ")}
                    {s.items.length > 2 ? ` +${s.items.length - 2}` : ""}
                    {s.customerName ? <div className="muted-xs">{s.customerName}</div> : null}
                  </td>
                  <td>
                    <span className={"pill " + (s.pay === "Nasiya" ? "low" : "ok")}>{s.pay}</span>
                    {s.outstanding > 0 ? <div className="muted-xs">Qarz: {money0(s.outstanding)}</div> : null}
                  </td>
                  <td className="r num">{money0(s.profit)}</td>
                  <td className="r num"><b>{money(s.total)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
