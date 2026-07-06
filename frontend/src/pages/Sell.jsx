import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api.js";
import { money, money0, stockState, fmtTime } from "../utils.js";
import { useToast } from "../toast.jsx";
import Scanner from "../components/Scanner.jsx";
import { PageHead } from "../components/ui.jsx";

const PAYS = ["Naqd", "Karta", "Click", "Payme", "Uzum", "Nasiya"];

export default function Sell() {
  const toast = useToast();
  const { branchId, branches } = useOutletContext();
  const branchName = branches?.find((b) => b.id === branchId)?.name;
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [pay, setPay] = useState("Naqd");
  const [customerId, setCustomerId] = useState("");
  const [prepaid, setPrepaid] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [weightAsk, setWeightAsk] = useState(null); // { product, value }
  // Discount UI state: mode + values. "none" hides the input.
  const [discountMode, setDiscountMode] = useState("none"); // none|pct|sum
  const [discountPct, setDiscountPct] = useState("");
  const [discountSum, setDiscountSum] = useState("");
  const [discountOpen, setDiscountOpen] = useState(false);
  const searchInputRef = useRef(null);
  // Store the latest checkout/filtered in refs so the keyboard handler can
  // read them without needing them to be declared above the useEffect. This
  // avoids a temporal dead zone crash (white screen on Sell page).
  const checkoutRef = useRef(() => {});
  const filteredRef = useRef([]);

  // Keyboard shortcuts for the cashier — cuts seconds off every sale.
  // F1: focus search   F2: open discount modal   F3: Naqd checkout
  // F4: Karta checkout  Esc: close any open modal
  useEffect(() => {
    function onKey(e) {
      // Never trigger shortcuts while the user is typing in an input/select
      // — that would break normal editing on things like the search box.
      const t = e.target;
      const isTyping = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
      if (e.key === "F1") { e.preventDefault(); searchInputRef.current?.focus(); return; }
      if (e.key === "F2") { e.preventDefault(); if (cart.length) setDiscountOpen(true); return; }
      if (e.key === "F3") { e.preventDefault(); if (cart.length) { setPay("Naqd"); setTimeout(() => checkoutRef.current?.(), 0); } return; }
      if (e.key === "F4") { e.preventDefault(); if (cart.length) { setPay("Karta"); setTimeout(() => checkoutRef.current?.(), 0); } return; }
      if (e.key === "Escape") {
        if (discountOpen) setDiscountOpen(false);
        else if (weightAsk) setWeightAsk(null);
        else if (scanOpen) setScanOpen(false);
        return;
      }
      // Enter in the search box picks the first matching product
      if (!isTyping) return;
      if (e.key === "Enter" && t === searchInputRef.current && filteredRef.current[0]) {
        e.preventDefault();
        addToCart(filteredRef.current[0]);
        setSearch("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, discountOpen, weightAsk, scanOpen]);

  async function loadProducts() {
    setLoading(true);
    try {
      setProducts(await api.get("/products"));
      setCustomers(await api.get("/customers"));
    } catch (e) {
      toast(e.message, "warn");
    }
    setLoading(false);
  }
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cats = useMemo(() => ["all", ...new Set(products.map((p) => p.category))], [products]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const okCat = cat === "all" || p.category === cat;
      const okQ = !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q);
      return okCat && okQ;
    });
  }, [products, search, cat]);

  function addToCart(product) {
    if (!product) return;
    const isFloat = product.unit === "kg" || product.unit === "litr" || product.unit === "metr";
    // Weight-based products ask for the exact quantity (e.g. 1.5 kg) instead
    // of always incrementing by 1. Dona/pors behave as before.
    if (isFloat) {
      setWeightAsk({ product, value: "" });
      return;
    }
    const inCart = cart.find((l) => l.id === product.id)?.qty || 0;
    if (inCart + 1 > product.stock) {
      toast(`"${product.name}" qoldiqda yetarli emas (${product.stock} ${product.unit || "dona"})`, "warn");
      return;
    }
    setCart((c) => {
      const line = c.find((l) => l.id === product.id);
      if (line) return c.map((l) => (l.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { id: product.id, name: product.name, price: product.price, qty: 1, unit: product.unit || "dona" }];
    });
  }

  function commitWeight() {
    if (!weightAsk) return;
    const p = weightAsk.product;
    const qty = Math.max(0, Number(weightAsk.value) || 0);
    if (qty <= 0) return toast("Miqdorni kiriting", "warn");
    if (qty > p.stock) return toast(`Qoldiq yetarli emas (${p.stock} ${p.unit})`, "warn");
    setCart((c) => {
      const line = c.find((l) => l.id === p.id);
      if (line) return c.map((l) => (l.id === p.id ? { ...l, qty: Math.round((line.qty + qty) * 1000) / 1000 } : l));
      return [...c, { id: p.id, name: p.name, price: p.price, qty, unit: p.unit || "dona" }];
    });
    setWeightAsk(null);
  }

  function onScanDetected(code) {
    const p = products.find((x) => x.barcode === code);
    if (!p) return toast(`Shtrix-kod topilmadi: ${code}`, "warn");
    addToCart(p);
    if (p.unit === "dona" || !p.unit || p.unit === "pors") toast(`${p.name} qo'shildi`, "ok");
  }
  function changeQty(id, delta) {
    setCart((c) => {
      const line = c.find((l) => l.id === id);
      if (!line) return c;
      const prod = products.find((p) => p.id === id);
      const isFloat = prod && (prod.unit === "kg" || prod.unit === "litr" || prod.unit === "metr");
      const step = isFloat ? 0.1 : 1;
      const next = Math.round((line.qty + delta * step) * 1000) / 1000;
      if (next <= 0) return c.filter((l) => l.id !== id);
      if (prod && next > prod.stock) {
        toast(`Qoldiq yetarli emas (${prod.stock} ${prod.unit || "dona"})`, "warn");
        return c;
      }
      return c.map((l) => (l.id === id ? { ...l, qty: next } : l));
    });
  }
  const removeLine = (id) => setCart((c) => c.filter((l) => l.id !== id));

  const subtotal = cart.reduce((a, l) => a + l.price * l.qty, 0);
  const count = cart.reduce((a, l) => a + l.qty, 0);
  // Discount: mode = "none" | "pct" | "sum". Percent applies to subtotal,
  // Sum is capped at subtotal so we never go negative.
  const discPct = Math.min(100, Math.max(0, Number(discountPct) || 0));
  const discSum = Math.min(subtotal, Math.max(0, Math.floor(Number(discountSum) || 0)));
  const disc = discountMode === "pct" ? Math.round(subtotal * discPct / 100)
             : discountMode === "sum" ? discSum
             : 0;
  const total = subtotal - disc;
  const isCredit = pay === "Nasiya";

  // Open a print-ready window with a 58mm-style receipt.
  function printReceipt(text) {
    if (!text) return window.print();
    const w = window.open("", "chek", "width=380,height=640");
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Chek</title>` +
      `<style>@page{size:58mm auto;margin:2mm}body{font-family:monospace;font-size:12px;white-space:pre;margin:0;padding:6px}</style>` +
      `</head><body>${text.replace(/</g, "&lt;")}</body></html>`
    );
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 200);
  }

  async function checkout() {
    if (!cart.length) return;
    if (isCredit && !customerId) return toast("Nasiya uchun mijozni tanlang", "warn");
    try {
      const sale = await api.post("/sales", {
        items: cart.map((l) => ({ productId: l.id, qty: l.qty })),
        pay,
        branchId: branchId || null,
        customerId: isCredit ? customerId : null,
        paid: isCredit ? Number(prepaid) || 0 : total,
        discount: discountMode === "sum" ? discSum : 0,
        discountPercent: discountMode === "pct" ? discPct : 0,
      });
      setReceipt(sale);
      setCart([]);
      setPay("Naqd");
      setCustomerId("");
      setPrepaid("");
      setDiscountMode("none");
      setDiscountPct("");
      setDiscountSum("");
      loadProducts();
    } catch (e) {
      toast(e.message, "warn");
    }
  }

  // Keep refs in sync with the latest values so the keyboard hook can call
  // them without stale closures or TDZ.
  checkoutRef.current = checkout;
  filteredRef.current = filtered;

  return (
    <>
      <PageHead title="Sotish" sub={branchName ? `Filial: ${branchName} · shtrix-kodni kameraga ko'rsating` : "Shtrix-kodni kameraga ko'rsating yoki mahsulotni tanlang"}>
        <button className="btn gold" onClick={() => setScanOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
            <path d="M7 12h10" />
          </svg>
          Skanerlash
        </button>
      </PageHead>

      <div className="pos">
        <div className="pos-left">
          <div className="scanbar">
            <div className="field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 5v14M7 5v14M11 5v14M14 5v14M18 5v14M21 5v14" />
              </svg>
              <input ref={searchInputRef} placeholder="Nom yoki shtrix-kod bo'yicha qidirish… (F1)" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {products.length > 0 && (
            <div className="cat-chips">
              {cats.map((c) => (
                <button key={c} className={"chip" + (c === cat ? " active" : "")} onClick={() => setCat(c)}>
                  {c === "all" ? "Hammasi" : c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="empty">Yuklanmoqda…</div>
          ) : products.length === 0 ? (
            <div className="empty big">
              <p>Ombor hali bo'sh.</p>
              <a className="btn primary" href="/panel/products">Mahsulot qo'shish</a>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((p) => {
                const st = stockState(p);
                return (
                  <button key={p.id} className="prod" disabled={st === "out"} onClick={() => addToCart(p)}>
                    <span className="pname">{p.name}</span>
                    <span className="pprice">{money(p.price)}</span>
                    <span className={"pstock " + (st === "ok" ? "" : st)}>
                      {st === "out" ? "Tugagan" : st === "low" ? `Kam: ${p.stock}` : `Qoldiq: ${p.stock}`}
                    </span>
                  </button>
                );
              })}
              {!filtered.length && <div className="empty span">Mahsulot topilmadi</div>}
            </div>
          )}
        </div>

        <div className="pos-right">
          <div className="card cart">
            <div className="cart-head">
              <h3>Savatcha</h3>
              {cart.length > 0 && <button className="clear" onClick={() => setCart([])}>Tozalash</button>}
            </div>

            {!cart.length ? (
              <div className="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
                  <path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.5-1.2L22 7H6" />
                </svg>
                <b>Savatcha bo'sh</b>
                <span>Skanerlang yoki mahsulot tanlang</span>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((l) => (
                    <div className="line" key={l.id}>
                      <div>
                        <div className="lname">{l.name}</div>
                        <div className="lunit">{money(l.price)} × {l.qty} {l.unit && l.unit !== "dona" ? l.unit : ""}</div>
                      </div>
                      <div className="lsum">{money0(l.price * l.qty)}</div>
                      <div className="qty">
                        <button onClick={() => changeQty(l.id, -1)}>−</button>
                        <span className="q">{l.qty}</span>
                        <button onClick={() => changeQty(l.id, 1)}>+</button>
                        <button className="rm" onClick={() => removeLine(l.id)}>O'chirish</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-foot">
                  <div className="pays">
                    {PAYS.map((p) => (
                      <button key={p} className={"pay" + (p === pay ? " active" : "")} onClick={() => setPay(p)}>{p}</button>
                    ))}
                  </div>

                  {isCredit && (
                    <div className="credit-box">
                      <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                        <option value="">Mijozni tanlang…</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ""}</option>
                        ))}
                      </select>
                      <input type="number" min="0" placeholder="Oldindan to'lov (ixtiyoriy)" value={prepaid} onChange={(e) => setPrepaid(e.target.value)} />
                      {!customers.length && <small className="hint">Avval "Mijozlar" bo'limidan mijoz qo'shing</small>}
                    </div>
                  )}

                  <div className="totals">
                    <div className="row"><span>Mahsulotlar ({count})</span><span>{money0(subtotal)}</span></div>
                    {disc > 0 && (
                      <div className="row disc">
                        <span>Chegirma {discountMode === "pct" ? `(${discPct}%)` : ""}</span>
                        <span>−{money0(disc)}</span>
                      </div>
                    )}
                    <div className="row grand"><span>Jami</span><span>{money(total)}</span></div>
                  </div>
                  <div className="disc-row">
                    <button className="btn ghost sm" onClick={() => setDiscountOpen(true)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 12l-8 8-8-8 8-8zM10 10h.01M14 14h.01M10 14l4-4" /></svg>
                      {disc > 0 ? `Chegirma: ${discountMode === "pct" ? discPct + "%" : money0(discSum)}` : "Chegirma qo'shish"}
                    </button>
                    {disc > 0 && (
                      <button className="btn ghost sm" onClick={() => { setDiscountMode("none"); setDiscountPct(""); setDiscountSum(""); }}>Olib tashlash</button>
                    )}
                  </div>
                  <button className="btn primary lg block" onClick={checkout}>
                    {isCredit ? "Nasiyaga berish" : "Sotish"} · {money(total)}
                  </button>
                  <div className="hotkeys">
                    <span><kbd>F1</kbd> Qidiruv</span>
                    <span><kbd>F2</kbd> Chegirma</span>
                    <span><kbd>F3</kbd> Naqd</span>
                    <span><kbd>F4</kbd> Karta</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {discountOpen && (
        <div className="overlay show" onClick={(e) => e.target === e.currentTarget && setDiscountOpen(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <h3>Chegirma qo'shish</h3>
              <button className="x" onClick={() => setDiscountOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="disc-tabs">
                <button className={"chip" + (discountMode === "pct" ? " active" : "")} onClick={() => setDiscountMode("pct")}>Foiz (%)</button>
                <button className={"chip" + (discountMode === "sum" ? " active" : "")} onClick={() => setDiscountMode("sum")}>Summa (so'm)</button>
              </div>
              {discountMode === "pct" && (
                <>
                  <div className="f full">
                    <label>Chegirma foizi</label>
                    <input type="number" min="0" max="100" autoFocus value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} placeholder="Masalan: 10" />
                  </div>
                  <div className="weight-chips">
                    {[5, 10, 15, 20, 25, 50].map((v) => (
                      <button key={v} className={"chip" + (Number(discountPct) === v ? " active" : "")} onClick={() => setDiscountPct(String(v))}>{v}%</button>
                    ))}
                  </div>
                </>
              )}
              {discountMode === "sum" && (
                <>
                  <div className="f full">
                    <label>Chegirma summasi (so'm)</label>
                    <input type="number" min="0" autoFocus value={discountSum} onChange={(e) => setDiscountSum(e.target.value)} placeholder="Masalan: 5000" />
                  </div>
                  <div className="weight-chips">
                    {[1000, 5000, 10000, 20000, 50000].map((v) => (
                      <button key={v} className={"chip" + (Number(discountSum) === v ? " active" : "")} onClick={() => setDiscountSum(String(v))}>{money0(v)}</button>
                    ))}
                  </div>
                </>
              )}
              {disc > 0 && (
                <div className="disc-preview">
                  <span>Chegirma summasi</span><b>−{money0(disc)}</b>
                </div>
              )}
              <div className="modal-foot">
                <button className="btn ghost" onClick={() => { setDiscountMode("none"); setDiscountPct(""); setDiscountSum(""); setDiscountOpen(false); }}>Olib tashlash</button>
                <button className="btn primary block" onClick={() => setDiscountOpen(false)}>Qo'llash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {weightAsk && (
        <div className="overlay show" onClick={(e) => e.target === e.currentTarget && setWeightAsk(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-head">
              <h3>{weightAsk.product.name}</h3>
              <button className="x" onClick={() => setWeightAsk(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-note">Miqdorni kiriting ({weightAsk.product.unit}). Masalan 1.5 yoki 0.250.</p>
              <div className="f full">
                <label>Miqdor ({weightAsk.product.unit})</label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  autoFocus
                  value={weightAsk.value}
                  onChange={(e) => setWeightAsk((s) => ({ ...s, value: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && commitWeight()}
                />
              </div>
              <div className="weight-chips">
                {[0.25, 0.5, 1, 1.5, 2, 3].map((v) => (
                  <button key={v} className={"chip" + (Number(weightAsk.value) === v ? " active" : "")} onClick={() => setWeightAsk((s) => ({ ...s, value: String(v) }))}>{v}</button>
                ))}
              </div>
              <div className="modal-foot">
                <button className="btn ghost" onClick={() => setWeightAsk(null)}>Bekor</button>
                <button className="btn primary block" onClick={commitWeight}>Qo'shish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {scanOpen && <Scanner onDetected={onScanDetected} onClose={() => setScanOpen(false)} />}

      {receipt && (
        <div className="overlay show">
          <div className="modal">
            <div className="modal-body receipt">
              <div className="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <h3>Sotuv yakunlandi</h3>
              <div className="rnum">Chek #{receipt.id.slice(0, 8).toUpperCase()} · {fmtTime(receipt.ts)}</div>
              <div className="rlines">
                {receipt.items.map((it, i) => (
                  <div className="rl" key={i}><span>{it.name} × {it.qty}</span><span>{money0(it.price * it.qty)}</span></div>
                ))}
              </div>
              <div className="rtotal">
                <span>Jami<div className="rt-pay">To'lov: {receipt.pay}{receipt.pay === "Nasiya" ? ` · qoldiq ${money0(receipt.total - (receipt.paid || 0))}` : ""}</div></span>
                <span>{money(receipt.total)}</span>
              </div>
              {receipt.fiscal && (
                <div className="fiscal">
                  <div className="fiscal-lbl">
                    {receipt.fiscal.mode === "test"
                      ? "OFD: sinov rejim (kalit sozlanmagan)"
                      : receipt.fiscal.ok
                        ? "OFD chek: yuborilgan ✓"
                        : "OFD xatosi: " + (receipt.fiscal.error || "")}
                  </div>
                  {receipt.fiscal.fiscalId && <div className="fiscal-id">Fiskal ID: {receipt.fiscal.fiscalId}</div>}
                </div>
              )}
              <div className="modal-foot">
                <button className="btn ghost" onClick={() => printReceipt(receipt.receiptText)}>Chop etish</button>
                <button className="btn primary block" onClick={() => setReceipt(null)}>Yangi sotuv</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
