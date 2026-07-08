import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api.js";
import { money, money0, fmtDate } from "../utils.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

export default function Invoices() {
  const toast = useToast();
  const { branchId: currentBranchId, branches } = useOutletContext() || {};
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [number, setNumber] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);

  async function load() {
    try {
      setRows(await api.get("/invoices"));
      setSuppliers(await api.get("/suppliers"));
      setProducts(await api.get("/products"));
    } catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const found = useMemo(() => {
    const q = search.toLowerCase(); if (!q) return [];
    const scope = branchId || currentBranchId || "";
    return products
      .filter((p) => !scope || (p.branchId || "") === scope)
      .filter((p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q))
      .slice(0, 6);
  }, [products, search, branchId, currentBranchId]);
  const total = items.reduce((a, x) => a + x.qty * x.cost, 0);

  function add(p) {
    setItems((s) => s.find((x) => x.id === p.id) ? s : [...s, { id: p.id, name: p.name, qty: 1, cost: p.cost || 0 }]);
    setSearch("");
  }
  const setF = (id, k, v) => setItems((s) => s.map((x) => x.id === id ? { ...x, [k]: v } : x));
  const rm = (id) => setItems((s) => s.filter((x) => x.id !== id));

  async function submit() {
    if (!items.length) return toast("Mahsulot tanlang", "warn");
    // If the shop has multiple branches and the owner didn't pick one, ask them.
    if ((branches?.length || 0) > 1 && !branchId && !currentBranchId) {
      return toast("Filial tanlang", "warn");
    }
    try {
      await api.post("/invoices", {
        supplierId, number, note,
        branchId: branchId || currentBranchId || undefined,
        items: items.map((x) => ({ productId: x.id, qty: Number(x.qty) || 0, cost: Number(x.cost) || 0 })),
      });
      toast("Faktura qabul qilindi, ombor to'ldirildi", "ok");
      setOpen(false); setItems([]); setNumber(""); setNote(""); setSupplierId(""); setBranchId(""); load();
    } catch (e) { toast(e.message, "warn"); }
  }

  return (
    <>
      <PageHead title="Faktura (kirim)" sub="Yetkazib beruvchidan kelgan tovarni qabul qilish">
        <button className="btn primary" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Yangi faktura
        </button>
      </PageHead>

      <div className="card">
        <table>
          <thead><tr><th>Sana</th><th>№</th><th>Yetkazib beruvchi</th><th>Qatorlar</th><th className="r">Summa</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const s = suppliers.find((x) => x.id === r.supplierId);
              return (
                <tr key={r.id}>
                  <td className="num">{fmtDate(new Date(r.ts))}</td>
                  <td className="tbarcode">{r.number || "—"}</td>
                  <td>{s ? s.name : "—"}</td>
                  <td className="muted-xs">{r.items.slice(0, 2).map((x) => `${x.name} ×${x.qty}`).join(", ")}{r.items.length > 2 ? " +" + (r.items.length - 2) : ""}</td>
                  <td className="r num"><b>{money(r.total)}</b></td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan="5"><div className="empty">Fakturalar yo'q</div></td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Yangi faktura" onClose={() => setOpen(false)} max="540px">
          {(branches?.length || 0) > 1 && !currentBranchId && (
            <div className="f full"><label>Qaysi filialga?</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                <option value="">Tanlang…</option>
                {branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>
            </div>
          )}
          <div className="fgrid">
            <div className="f"><label>Yetkazib beruvchi</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Tanlang…</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="f"><label>Faktura raqami</label><input value={number} onChange={(e) => setNumber(e.target.value)} /></div>
          </div>
          <div className="f full"><label>Mahsulot qidirish</label><input placeholder="Nom yoki shtrix-kod" value={search} onChange={(e) => setSearch(e.target.value)} />
            {found.length > 0 && (
              <div className="picklist">
                {found.map((p) => <button key={p.id} className="pickrow" onClick={() => add(p)}><span>{p.name}</span><b>{money(p.cost)}</b></button>)}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="picked">
              {items.map((x) => (
                <div className="line" key={x.id}>
                  <div><div className="lname">{x.name}</div></div>
                  <div className="qty-inv">
                    <input type="number" min="1" value={x.qty} onChange={(e) => setF(x.id, "qty", e.target.value)} placeholder="Soni" />
                    <input type="number" min="0" value={x.cost} onChange={(e) => setF(x.id, "cost", e.target.value)} placeholder="Tannarx" />
                    <button className="rm" onClick={() => rm(x.id)}>O'chirish</button>
                  </div>
                  <div className="lsum">{money0(x.qty * x.cost)}</div>
                </div>
              ))}
              <div className="picked-total"><span>Jami</span><b>{money(total)}</b></div>
            </div>
          )}

          <div className="f full"><label>Izoh</label><input value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setOpen(false)}>Bekor</button>
            <button className="btn primary block" onClick={submit}>Qabul qilish</button>
          </div>
        </Modal>
      )}
    </>
  );
}
