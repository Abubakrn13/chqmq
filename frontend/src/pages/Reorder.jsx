import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0 } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead } from "../components/ui.jsx";

// Auto-generated order drafts for low-stock products, grouped by supplier.
// Owner reviews then sends via Telegram to the supplier.
export default function Reorder() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [sending, setSending] = useState(null);

  async function load() {
    try { setData(await api.get("/reorder")); }
    catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); }, []);

  async function send(group) {
    setSending(group.supplierId || "unspecified");
    try {
      const r = await api.post("/reorder/send", { supplierId: group.supplierId });
      toast(`Buyurtma Telegramga jo'natildi (${r.sent} ta chatga)`, "ok");
    } catch (e) { toast(e.message, "warn"); }
    setSending(null);
  }

  return (
    <>
      <PageHead title="Buyurtma tavsiyalari" sub="Kam qolgan mahsulotlar — Telegramga taklif matnini yuboring" />

      {data && !data.groups.length ? (
        <div className="card panel"><div className="empty" style={{ padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 6 }}>📦</div>
          <div>Kam qolgan mahsulot yo'q</div>
          <div className="muted-xs" style={{ marginTop: 6 }}>Zaxira yaxshi holatda</div>
        </div></div>
      ) : (
        (data?.groups || []).map((g) => (
          <div className="card" key={g.supplierId || "unspec"} style={{ marginBottom: 12 }}>
            <div className="reord-head">
              <div>
                <h3 style={{ margin: 0 }}>{g.supplierName}</h3>
                {g.supplierPhone && <div className="muted-xs">{g.supplierPhone}</div>}
              </div>
              <button
                className="btn primary"
                disabled={sending === (g.supplierId || "unspecified")}
                onClick={() => send(g)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3 2 10.5l6 2L18 6l-7.5 8.5.4 6L14 16l4.5 3.2L22 3Z" /></svg>
                Telegramga yuborish
              </button>
            </div>
            <table>
              <thead><tr><th>Mahsulot</th><th className="r">Qoldiq</th><th className="r">Chegara</th><th className="r">Buyurtma miqdori</th><th className="r">Taxminiy</th></tr></thead>
              <tbody>
                {g.items.map((it) => (
                  <tr key={it.id}>
                    <td className="tname">{it.name}</td>
                    <td className="r num" style={{ color: "var(--anor)" }}>{it.stock} {it.unit}</td>
                    <td className="r num muted-xs">{it.low} {it.unit}</td>
                    <td className="r num"><b>{it.suggested} {it.unit}</b></td>
                    <td className="r num">{money0(it.cost * it.suggested)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="reord-foot">
              <span className="muted-xs">Umumiy taxminiy tannarx:</span>
              <b>{money(g.estCost)}</b>
            </div>
          </div>
        ))
      )}
    </>
  );
}
