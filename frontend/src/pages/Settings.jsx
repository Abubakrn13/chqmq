import { useState } from "react";
import { api, getToken } from "../api.js";
import { fmtDate, subActive, subDaysLeft, subEndsAt, TELEGRAM } from "../utils.js";
import { useToast } from "../toast.jsx";
import { useAuth } from "../auth.jsx";
import { PageHead } from "../components/ui.jsx";

export default function Settings() {
  const toast = useToast();
  const { shop, user, refresh } = useAuth();
  const [name, setName] = useState(shop?.name || "");
  const [busy, setBusy] = useState(false);
  const sub = shop?.subscription || {};
  const active = subActive(sub);
  const daysLeft = subDaysLeft(sub);
  const endsAt = subEndsAt(sub);

  async function saveShop() {
    if (!name.trim()) return toast("Do'kon nomini kiriting", "warn");
    setBusy(true);
    try {
      await api.put("/auth/shop", { name });
      await refresh();
      toast("Saqlandi", "ok");
    } catch (e) {
      toast(e.message, "warn");
    }
    setBusy(false);
  }

  // Trigger a browser download with the auth header attached — plain <a href
  // download> can't set Bearer, so we fetch as a blob and click a temporary link.
  async function downloadAuthed(path, filename) {
    try {
      const r = await fetch("/api" + path, { headers: { Authorization: "Bearer " + getToken() } });
      if (!r.ok) throw new Error("Yuklab olib bo'lmadi (" + r.status + ")");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast("Yuklab olindi", "ok");
    } catch (e) {
      toast(e.message, "warn");
    }
  }

  return (
    <>
      <PageHead title="Sozlamalar" sub="Do'kon ma'lumotlari va foydalanish muddati" />

      <div className="card panel set-block">
        <h3>Do'kon ma'lumotlari</h3>
        <div className="sub">Bu nom cheklar va panelda ko'rinadi</div>
        <div className="set-row">
          <div className="f full"><label>Do'kon nomi</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={user?.role !== "owner"}
              readOnly={user?.role !== "owner"}
            />
          </div>
          {user?.role === "owner" && (
            <button className="btn primary" disabled={busy} onClick={saveShop}>{busy ? "Saqlanmoqda…" : "Saqlash"}</button>
          )}
        </div>
      </div>

      {user?.role === "owner" && (
        <div className="card panel set-block">
          <h3>Ma'lumotlar zaxirasi (backup)</h3>
          <div className="sub">Xavfsizlik uchun har hafta yuklab olishni tavsiya qilamiz</div>
          <div className="backup-row">
            <button className="btn" onClick={() => downloadAuthed("/backup", `chaqmoq-backup-${new Date().toISOString().slice(0, 10)}.json`)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
              To'liq zaxira (JSON)
            </button>
            <button className="btn" onClick={() => downloadAuthed("/backup/products.csv", `mahsulotlar-${new Date().toISOString().slice(0, 10)}.csv`)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 13h6M9 17h6" /></svg>
              Mahsulotlar (Excel/CSV)
            </button>
            <button className="btn" onClick={() => downloadAuthed("/backup/sales.csv", `sotuvlar-${new Date().toISOString().slice(0, 10)}.csv`)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 13h6M9 17h6" /></svg>
              Sotuvlar tarixi (CSV)
            </button>
          </div>
          <p className="modal-note" style={{ marginTop: 12, marginBottom: 0 }}>
            To'liq zaxirani xavfsiz joyga (Google Drive, USB) saqlang. Yo'qotsangiz biz bilan bog'lanib qayta tiklashimiz mumkin.
          </p>

          <div className="info-band" style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "linear-gradient(135deg,#E7F5F3,#D5EBE7)", border: "1px solid #B9DED8" }}>
            <b style={{ color: "var(--brand-900)", fontSize: 14 }}>🛡 Avtomatik xavfsizlik</b>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink)", lineHeight: 1.6 }}>
              Tizim ma'lumotlaringizni himoya qilish uchun uch qatlamli tizim ishlatadi:
              <br />• <b>Har yozuvda:</b> asosiy faylga xavfsiz yozib olamiz (atomic write)
              <br />• <b>Har 10 daqiqada:</b> ehtiyot nusxa yaratiladi — asosiy fayl buzilsa avtomatik tiklanadi
              <br />• <b>Har kuni:</b> to'liq zaxira alohida saqlanadi va Telegram orqali sizga jo'natiladi (agar bog'langan bo'lsangiz)
              <br />
              Server yiqilsa ham ma'lumot omon qoladi.
            </p>
          </div>
        </div>
      )}

      {user?.role === "owner" && (
        <div className="card panel set-block">
          <h3>Foydalanish muddati</h3>
          <div className="access-row">
            <div className={"access-state " + (active ? "ok" : "off")}>
              <div className="access-days">{active && daysLeft != null ? daysLeft : 0}</div>
              <div className="access-lbl">{active ? "kun qoldi" : "muddat tugagan"}</div>
            </div>
            <div className="access-info">
              <div>
                Holat:{" "}
                {active
                  ? <span className="pill ok">Faol</span>
                  : <span className="pill out">{sub.status === "suspended" ? "To'xtatilgan" : "Muddati tugagan"}</span>}
              </div>
              {endsAt && <div className="muted-xs" style={{ marginTop: 6 }}>Amal qilish sanasi: {fmtDate(new Date(endsAt))} gacha</div>}
              <p className="modal-note" style={{ marginTop: 12, marginBottom: 0 }}>
                Muddatni uzaytirish uchun biz bilan bog'laning — kerakli kunga faollashtiramiz.
              </p>
              <a className="btn primary tg" href={TELEGRAM} target="_blank" rel="noreferrer" style={{ marginTop: 12 }}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 3 2 10.5l6 2L18 6l-7.5 8.5.4 6L14 16l4.5 3.2L22 3Z" /></svg>
                Vaqt sotib olish
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
