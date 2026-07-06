import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";

const KINDS = [
  { id: "gastronom", label: "Gastronom / oziq-ovqat" },
  { id: "aptek", label: "Dorixona" },
  { id: "kiyim", label: "Kiyim-kechak" },
  { id: "kans", label: "Kanselyariya / maktab" },
  { id: "elektronika", label: "Elektronika" },
  { id: "kosmetika", label: "Kosmetika" },
  { id: "boshqa", label: "Boshqa" },
];

const STEPS = 5;

// A small onboarding flow the owner sees once. Answers are stored on the shop
// so the AI and the dashboard can personalize their output.
export default function Onboarding() {
  const nav = useNavigate();
  const toast = useToast();
  const { shop, refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    ownerName: "",
    staffCount: 2,
    shopKind: "gastronom",
    monthlyRevenue: 0,
    hasFiscal: false,
    workHours: "09:00 - 22:00",
  });
  const [busy, setBusy] = useState(false);

  function next() { setStep((s) => Math.min(STEPS - 1, s + 1)); }
  function back() { setStep((s) => Math.max(0, s - 1)); }

  async function finish() {
    setBusy(true);
    try {
      await api.put("/auth/shop-profile", { profile: f });
      await refresh();
      toast("Sozlangan! Xush kelibsiz", "ok");
      nav("/panel/dashboard");
    } catch (e) {
      toast(e.message, "warn");
    }
    setBusy(false);
  }

  return (
    <div className="onboard">
      <div className="onboard-card card">
        <div className="onboard-top">
          <div className="onboard-mark">
            <svg viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#C2922E" stroke="#C2922E" strokeWidth="1.2" strokeLinejoin="round" /></svg>
          </div>
          <div className="onboard-prog">
            {Array.from({ length: STEPS }).map((_, i) => (
              <span key={i} className={i <= step ? "on" : ""} />
            ))}
          </div>
        </div>

        <div className="onboard-body">
          {step === 0 && (
            <>
              <h2>Salom{shop?.name ? `, ${shop.name}` : ""}!</h2>
              <p>Do'koningizni yaxshiroq tanish uchun bir necha savol beramiz — bu 1 daqiqa. Javoblaringiz keyingi ishlarni tezlashtiradi va AI tavsiyalarni aniqroq qiladi.</p>
              <div className="f full"><label>Sizning ismingiz</label>
                <input autoFocus value={f.ownerName} onChange={(e) => setF({ ...f, ownerName: e.target.value })} placeholder="Egasi ismi" onKeyDown={(e) => e.key === "Enter" && next()} />
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2>Do'kon turi</h2>
              <p>Bu AI tavsiyalari va standart mahsulotlar uchun kerak.</p>
              <div className="kind-grid">
                {KINDS.map((k) => (
                  <button key={k.id} className={"kind" + (f.shopKind === k.id ? " active" : "")} onClick={() => setF({ ...f, shopKind: k.id })}>{k.label}</button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Necha kishi ishlaydi?</h2>
              <p>Xodimlar soni — sotuvchilar, menejer va o'zingiz.</p>
              <div className="staff-picker">
                <button onClick={() => setF({ ...f, staffCount: Math.max(1, f.staffCount - 1) })}>−</button>
                <div className="staff-n">{f.staffCount}</div>
                <button onClick={() => setF({ ...f, staffCount: f.staffCount + 1 })}>+</button>
              </div>
              <p className="modal-note">Har biri uchun keyinroq alohida login yaratasiz (Xodimlar bo'limi).</p>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Taxminiy oylik tushum</h2>
              <p>Bu sizga foyda va oylik hisobiga qanchalik tez erishayotganingizni ko'rsatishga yordam beradi. Aniq bilmasangiz taxmin qiling.</p>
              <div className="f full"><label>So'mda (masalan 50 000 000)</label>
                <input type="number" min="0" value={f.monthlyRevenue} onChange={(e) => setF({ ...f, monthlyRevenue: e.target.value })} />
              </div>
              <div className="f full"><label>Ish soati</label>
                <input value={f.workHours} onChange={(e) => setF({ ...f, workHours: e.target.value })} placeholder="Masalan: 09:00 - 22:00" />
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h2>Fiskal kassa (OFD)</h2>
              <p>Fiskal chek yozadigan tizimingiz allaqachon bormi? Bo'lsa, sozlashda yordam beramiz. Yo'q bo'lsa hozircha sinov rejimida ishlaydi.</p>
              <div className="ynrow">
                <button className={"yn" + (f.hasFiscal ? " active" : "")} onClick={() => setF({ ...f, hasFiscal: true })}>Ha, bor</button>
                <button className={"yn" + (!f.hasFiscal ? " active" : "")} onClick={() => setF({ ...f, hasFiscal: false })}>Yo'q, hali yo'q</button>
              </div>
            </>
          )}
        </div>

        <div className="onboard-nav">
          {step > 0 && <button className="btn ghost" onClick={back}>Ortga</button>}
          <div className="spacer" />
          {step < STEPS - 1 ? (
            <button className="btn primary" onClick={next} disabled={step === 0 && !f.ownerName.trim()}>Keyingi →</button>
          ) : (
            <button className="btn primary" onClick={finish} disabled={busy}>{busy ? "Saqlanmoqda…" : "Tayyor"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
