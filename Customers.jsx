import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { money, money0, fmtDate } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

export default function Return() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [returns, setReturns] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState([]); // [{id,name,price,qty}]
  const [reason, setReason] = useState("");

  async function load() {
    try {
      setProducts(await api.get("/products"));
      setReturns(await api.get("/returns"));
    } catch (e) {
      toast(e.message, "warn");
    }
  }
  useEffect(() => {
    load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const found = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q)).slice(0, 6);
  }, [products, search]);

  function add(p) {
    setPicked((s) => (s.find((x) => x.id === p.id) ? s : [...s, { id: p.id, name: p.name, price: p.price, qty: 1 }]));
    setSearch("");
  }
  const setQty = (id, q) => setPicked((s) => s.map((x) => (x.id === id ? { ...x, qty: Math.max(1, q) } : x)));
  const rm = (id) => setPicked((s) => s.filter((x) => x.id !== id));
  const total = picked.reduce((a, x) => a + x.price * x.qty, 0);

  async function submit() {
    if (!picked.length) return toast("Mahsulot tanlang", "warn");
    try {
      await api.post("/returns", { items: picked.map((x) => ({ productId: x.id, qty: x.qty })), reason });
      toast("Qaytarish qayd etildi, ombor to'ldirildi", "ok");
      setOpen(false);
      setPicked([]);
      setReason("");
      load();
    } catch (e) {
      toast(e.message, "warn");
    }
  }

  return (
    <>
      <PageHead title="Qaytarish" sub="Qaytarilgan tovar omborga qayta qo'shiladi">
        <button className="btn primary" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" /></svg>
          Yangi qaytarish
        </button>
      </PageHead>

      {!returns.length ? (
        <div className="card"><div className="empty">Hozircha qaytarishlar yo'q</div></div>
      ) : (
        <div className="card">
          <table>
            <thead><tr><th>Sana</th><th>Mahsulotlar</th><th>Sabab</th><th className="r">Summa</th></tr></thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id}>
                  <td className="num">{fmtDate(new Date(r.ts))}</td>
                  <td>{r.items.map((it) => `${it.name} ×${it.qty}`).join(", ")}</td>
                  <td className="muted-xs">{r.reason || "—"}</td>
                  <td className="r num"><b>{money(r.amount)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="Yangi qaytarish" onClose={() => setOpen(false)} max="480px">
          <div className="f full">
            <label>Mahsulot qidirish</label>
            <input placeholder="Nom yoki shtrix-kod…" value={search} onChange={(e) => setSearch(e.target.value)} />
            {found.length > 0 && (
              <div className="picklist">
                {found.map((p) => (
                  <button key={p.id} className="pickrow" onClick={() => add(p)}>
                    <span>{p.name}</span><b>{money(p.price)}</b>
                  </button>
                ))}
              </div>
            )}
          </div>

          {picked.length > 0 && (
            <div className="picked">
              {picked.map((x) => (
                <div className="line" key={x.id}>
                  <div><div className="lname">{x.name}</div><div className="lunit">{money(x.price)}</div></div>
                  <div className="lsum">{money0(x.price * x.qty)}</div>
                  <div className="qty">
                    <button onClick={() => setQty(x.id, x.qty - 1)}>−</button>
                    <span className="q">{x.qty}</span>
                    <button onClick={() => setQty(x.id, x.qty + 1)}>+</button>
                    <button className="rm" onClick={() => rm(x.id)}>O'chirish</button>
                  </div>
                </div>
              ))}
              <div className="picked-total"><span>Jami qaytariladi</span><b>{money(total)}</b></div>
            </div>
          )}

          <div className="f full" style={{ marginTop: 12 }}>
            <label>Sabab (ixtiyoriy)</label>
            <input placeholder="Masalan: buzuq, muddati o'tgan…" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setOpen(false)}>Bekor</button>
            <button className="btn primary block" onClick={submit}>Qaytarishni tasdiqlash</button>
          </div>
        </Modal>
      )}
    </>
  );
}
