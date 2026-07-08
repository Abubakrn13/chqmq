import { useEffect, useState } from "react";

const EMPTY = {
  name: "",
  barcode: "",
  category: "",
  unit: "dona",
  price: "",
  cost: "",
  stock: "",
  low: 5,
};

export default function ProductModal({ product, onSave, onClose, categories = [], branches = [], currentBranchId = "" }) {
  const [f, setF] = useState(EMPTY);

  useEffect(() => {
    if (product) setF({ ...product });
    else setF({ ...EMPTY, branchId: currentBranchId || (branches[0]?.id ?? "") });
    // Intentionally do NOT depend on `branches` or `currentBranchId` — they
    // change identity on every parent render and would wipe the user's
    // in-progress typing. We only re-initialize when the modal opens/closes
    // (product prop transitions null <-> object).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  function set(k, v) {
    setF((s) => ({ ...s, [k]: v }));
  }

  return (
    <div className="overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{product ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</h3>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="f full">
            <label>Nomi</label>
            <input
              autoFocus
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Masalan: Coca-Cola 1L"
            />
          </div>
          <div className="fgrid">
            <div className="f">
              <label>Shtrix-kod</label>
              <input value={f.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="4780…" />
            </div>
            <div className="f">
              <label>Kategoriya</label>
              <input
                list="chaqmoq-cats"
                value={f.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="Masalan: Ichimlik"
              />
              <datalist id="chaqmoq-cats">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {branches.length > 1 && !product && (
              <div className="f full">
                <label>Qaysi filialga tegishli?</label>
                <select value={f.branchId || ""} onChange={(e) => set("branchId", e.target.value)}>
                  {branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </select>
              </div>
            )}
            <div className="f">
              <label>O'lchov birligi</label>
              <select value={f.unit || "dona"} onChange={(e) => set("unit", e.target.value)}>
                <option value="dona">Dona</option>
                <option value="kg">Kilogramm (kg)</option>
                <option value="litr">Litr</option>
                <option value="metr">Metr</option>
                <option value="pors">Pors / to'plam</option>
              </select>
            </div>
            <div className="f">
              <label>Sotuv narxi (so'm{f.unit && f.unit !== "dona" && f.unit !== "pors" ? ` / 1 ${f.unit}` : ""})</label>
              <input type="number" min="0" value={f.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div className="f">
              <label>Tannarx (so'm{f.unit && f.unit !== "dona" && f.unit !== "pors" ? ` / 1 ${f.unit}` : ""})</label>
              <input type="number" min="0" value={f.cost} onChange={(e) => set("cost", e.target.value)} />
            </div>
            <div className="f">
              <label>Qoldiq ({f.unit || "dona"})</label>
              <input
                type="number"
                min="0"
                step={f.unit === "kg" || f.unit === "litr" || f.unit === "metr" ? "0.001" : "1"}
                value={f.stock}
                onChange={(e) => set("stock", e.target.value)}
              />
            </div>
            <div className="f">
              <label>Kam qoldiq chegarasi</label>
              <input
                type="number"
                min="0"
                step={f.unit === "kg" || f.unit === "litr" || f.unit === "metr" ? "0.1" : "1"}
                value={f.low}
                onChange={(e) => set("low", e.target.value)}
              />
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={onClose}>
              Bekor qilish
            </button>
            <button className="btn primary block" onClick={() => onSave(f)}>
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
