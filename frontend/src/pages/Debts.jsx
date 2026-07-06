import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money, money0, fmtDate } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

export default function Debts() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [paying, setPaying] = useState(null); // debt row
  const [amount, setAmount] = useState("");

  async function load() {
    try {
      setData(await api.get("/debts"));
    } catch (e) {
      toast(e.message, "warn");
    }
  }
  useEffect(() => {
    load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openPay(row) {
    setPaying(row);
    setAmount(String(row.outstanding));
  }
  async function submitPay() {
    const amt = Number(amount) || 0;
    if (amt <= 0) return toast("Summani kiriting", "warn");
    try {
      await api.post("/debts/pay", { saleId: paying.id, amount: amt });
      toast("To'lov qabul qilindi", "ok");
      setPaying(null);
      load();
    } catch (e) {
      toast(e.message, "warn");
    }
  }

  return (
    <>
      <PageHead title="Qarzlar (nasiya)" sub={data ? `${data.rows.length} ta ochiq qarz · jami ${money0(data.totalDebt)} so'm` : ""} />
      {!data ? (
        <div className="empty">Yuklanmoqda…</div>
      ) : !data.rows.length ? (
        <div className="card"><div className="empty">Ochiq qarzlar yo'q — barchasi to'langan 👍</div></div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr><th>Mijoz</th><th>Sana</th><th className="r">Umumiy</th><th className="r">To'langan</th><th className="r">Qoldiq</th><th className="r"></th></tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <td><div className="tname">{r.customerName}</div>{r.customerPhone ? <div className="tbarcode">{r.customerPhone}</div> : null}</td>
                  <td className="num">{fmtDate(new Date(r.ts))}</td>
                  <td className="r num">{money0(r.total)}</td>
                  <td className="r num">{money0(r.paid)}</td>
                  <td className="r num"><b style={{ color: "var(--anor)" }}>{money0(r.outstanding)}</b></td>
                  <td className="r"><button className="btn primary sm" onClick={() => openPay(r)}>To'lash</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paying && (
        <Modal title="Qarzni to'lash" onClose={() => setPaying(null)} max="380px">
          <p className="modal-note">{paying.customerName} · qoldiq <b>{money(paying.outstanding)}</b></p>
          <div className="f full">
            <label>To'lov summasi (so'm)</label>
            <input type="number" min="0" value={amount} autoFocus onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitPay()} />
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setPaying(null)}>Bekor</button>
            <button className="btn primary block" onClick={submitPay}>Qabul qilish</button>
          </div>
        </Modal>
      )}
    </>
  );
}
