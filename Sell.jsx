import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api.js";
import { money, money0, fmtDate, fmtTime } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

// Move stock between branches. The source product's stock decreases and
// an equivalent product on the destination branch is created (or increased).
export default function Transfers() {
  const toast = useToast();
  const { branches = [] } = useOutletContext() || {};
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);

  async function load() {
    try {
      setRows(await api.get("/transfers"));
      setProducts(await api.get("/products"));
    } catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const branchName = (id) => (branches.find((b) => b.id === id) || {}).name || "—";

  const found = useMemo(() => {
    const q = search.toLowerCase(); if (!q) return [];
    return products
      .filter((p) => from && (p.branchId || null) === from)
      .filter((p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q))
      .slice(0, 6);
  }, [products, search, from]);

  function add(p) {
    setItems((s) => s.find((x) => x.id === p.id) ? s : [...s, { id: p.id, name: p.name, qty: 1, stock: p.stock, cost: p.cost }]);
    setSearch("");
  }
  const setQ = (id, v) => setItems((s) => s.map((x) => x.id === id ? { ...x, qty: v } : x));
  const rm = (id) => setItems((s) => s.filter((x) => x.id !== id));

  const total = items.reduce((a, x) => a + (Number(x.qty) || 0) * x.cost, 0);

  async function submit() {
    if (!from || !to) return toast("Filiallarni tanlang", "warn");
    if (from === to) return toast("Bir xil filialga o'tkazolmaysiz", "warn");
    if (!items.length) return toast("Mahsulot tanlang", "warn");
    try {
      await api.post("/transfers", {
        fromBranchId: from,
        toBranchId: to,
        note,
        items: items.map((x) => ({ productId: x.id, qty: Number(x.qty) || 0 })),
      });
      toast("O'tkazma bajarildi", "ok");
      setOpen(false); setItems([]); setNote(""); load();
    } catch (e) { toast(e.message, "warn"); }
  }

  if (branches.length < 2) {
    return (
      <>
        <PageHead title="Filiallar orasi o'tkazma" sub="Bir filialdan ikkinchisiga tovar o'tkazish" />
        <div className="card panel"><div className="empty">O'tkazma qilish uchun kamida 2 ta filial kerak. "Filiallar" bo'limidan yangi filial qo'shing.</div></div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Filiallar orasi o'tkazma" sub="Bir filialdan ikkinchisiga tovar o'tkazish">
        <button className="btn primary" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          Yangi o'tkazma
        </button>
      </PageHead>

      <div className="card">
        <table>
          <thead><tr><th>Sana</th><th>Kim</th><th>Qayerdan</th><th>Qayerga</th><th className="r">Pozitsiya</th><th className="r">Qiymati</th></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="num">{fmtDate(new Date(t.ts))} {fmtTime(t.ts)}</td>
                <td>{t.userName}</td>
                <td><span className="cat-tag">{branchName(t.fromBranchId)}</span></td>
                <td><span className="cat-tag">{branchName(t.toBranchId)}</span></td>
                <td className="r num">{t.items.length}</td>
                <td className="r num"><b>{money(t.totalValue)}</b></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="6"><div className="empty">O'tkazmalar yo'q</div></td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Yangi o'tkazma" onClose={() => setOpen(false)} max="540px">
          <div className="fgrid">
            <div className="f"><label>Qayerdan</label>
              <select value={from} onChange={(e) => { setFrom(e.target.value); setItems([]); }}>
                <option value="">Tanlang…</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="f"><label>Qayerga</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">Tanlang…</option>
                {branches.filter((b) => b.id !== from).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {from && (
            <div className="f full"><label>Mahsulot qidirish (manba filialdan)</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom yoki shtrix-kod" />
              {found.length > 0 && (
                <div className="picklist">
                  {found.map((p) => (
                    <button key={p.id} className="pickrow" onClick={() => add(p)}>
                      <span>{p.name}</span><b>{p.stock} dona</b>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {items.length > 0 && (
            <div className="picked">
              {items.map((x) => (
                <div className="line" key={x.id}>
                  <div><div className="lname">{x.name}</div><div className="muted-xs">Zaxira: {x.stock} dona</div></div>
                  <div className="qty-inv">
                    <input type="number" min="1" max={x.stock} value={x.qty} onChange={(e) => setQ(x.id, e.target.value)} placeholder="Soni" />
                    <button className="rm" onClick={() => rm(x.id)}>O'chirish</button>
                  </div>
                  <div className="lsum">{money0((Number(x.qty) || 0) * x.cost)}</div>
                </div>
              ))}
              <div className="picked-total"><span>Umumiy qiymat</span><b>{money(total)}</b></div>
            </div>
          )}

          <div className="f full"><label>Izoh (ixtiyoriy)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Masalan: Yangi tovar keldi, taqsimladim" />
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setOpen(false)}>Bekor</button>
            <button className="btn primary block" onClick={submit}>O'tkazish</button>
          </div>
        </Modal>
      )}
    </>
  );
}
