import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api.js";
import { money0, stockState } from "../utils.js";
import { useToast } from "../toast.jsx";
import ProductModal from "../components/ProductModal.jsx";
import { PageHead } from "../components/ui.jsx";

export default function Products() {
  const toast = useToast();
  const { branchId, branches } = useOutletContext() || {};
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(undefined); // undefined=closed, null=new, obj=edit

  async function load() {
    try {
      setProducts(await api.get("/products"));
    } catch (e) {
      toast(e.message, "warn");
    }
  }
  useEffect(() => {
    load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q));
  }, [products, search]);
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );
  const lowCount = products.filter((p) => stockState(p) === "low").length;
  const outCount = products.filter((p) => stockState(p) === "out").length;
  const stockValue = products.reduce((a, p) => a + p.cost * p.stock, 0);

  async function save(form) {
    if (!String(form.name).trim()) return toast("Mahsulot nomini kiriting", "warn");
    try {
      if (form.id) {
        await api.put("/products/" + form.id, form);
        toast("Mahsulot yangilandi", "ok");
      } else {
        await api.post("/products", form);
        toast("Mahsulot qo'shildi", "ok");
      }
      setEditing(undefined);
      load();
    } catch (e) {
      toast(e.message, "warn");
    }
  }
  async function remove(p) {
    if (!confirm(`"${p.name}" o'chirilsinmi?`)) return;
    try {
      await api.del("/products/" + p.id);
      toast("Mahsulot o'chirildi", "ok");
      load();
    } catch (e) {
      toast(e.message, "warn");
    }
  }

  return (
    <>
      <PageHead title="Mahsulotlar" sub={`${products.length} ta mahsulot · ${lowCount} kam qoldiq · ${outCount} tugagan · ombor qiymati ${money0(stockValue)} so'm`}>
        <button className="btn primary" onClick={() => setEditing(null)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Mahsulot qo'shish
        </button>
      </PageHead>

      <div className="toolbar">
        <div className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
          <input placeholder="Nom yoki shtrix-kod bo'yicha qidirish…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Mahsulot</th><th>Kategoriya</th><th className="r">Narx</th><th className="r">Tannarx</th>
              <th className="r">Qoldiq</th><th>Holat</th><th className="r"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const st = stockState(p);
              return (
                <tr key={p.id}>
                  <td><div className="tname">{p.name}</div><div className="tbarcode">{p.barcode || "—"}</div></td>
                  <td><span className="cat-tag">{p.category}</span></td>
                  <td className="r num">{money0(p.price)}</td>
                  <td className="r num">{money0(p.cost)}</td>
                  <td className="r num">{p.stock} <small className="muted-xs">{p.unit || "dona"}</small></td>
                  <td>{st === "out" ? <span className="pill out">Tugagan</span> : st === "low" ? <span className="pill low">Kam qoldiq</span> : <span className="pill ok">Yetarli</span>}</td>
                  <td className="r">
                    <div className="rowact">
                      <button className="iconbtn" title="Tahrirlash" onClick={() => setEditing(p)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
                      </button>
                      <button className="iconbtn del" title="O'chirish" onClick={() => remove(p)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan="7"><div className="empty">Mahsulot topilmadi</div></td></tr>}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <ProductModal
          product={editing}
          onSave={save}
          onClose={() => setEditing(undefined)}
          categories={categories}
          branches={branches || []}
          currentBranchId={branchId || ""}
        />
      )}
    </>
  );
}
