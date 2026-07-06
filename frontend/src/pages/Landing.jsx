import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../auth.jsx";
import { TELEGRAM } from "../utils.js";

export default function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    nav(user.role === "superadmin" ? "/superadmin" : "/panel/dashboard", { replace: true });
  }, [user, loading, nav]);
  return (
    <div className="land">
      {/* Nav */}
      <header className="lnav">
        <div className="lnav-in">
          <Link to="/" className="lbrand">
            <span className="mark">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#FFE7A6" stroke="#FFE7A6" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </span>
            Chaqmoq
          </Link>
          <nav className="lnav-links">
            <a href="#imkoniyatlar">Imkoniyatlar</a>
            <a href="#taqqoslash">Taqqoslash</a>
            <a href="#narx">Narxlar</a>
          </nav>
          <div className="lnav-cta">
            <Link to="/login" className="btn ghost">Kirish</Link>
            <a href={TELEGRAM} target="_blank" rel="noreferrer" className="btn primary">Login olish</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">O'zbekiston do'konlari uchun</span>
            <h1>Internetsiz ham<br />to'xtamaydigan kassa</h1>
            <p>
              Telefon kamerasiga shtrix-kodni ko'rsating — mahsulot savatga o'zi tushadi. Kassa,
              ombor va hisobot bitta tezkor tizimda. Internet uzilsa ham sotuv davom etadi.
            </p>
            <div className="hero-actions">
              <a href={TELEGRAM} target="_blank" rel="noreferrer" className="btn primary lg">Hisob ochtirish</a>
              <a href="#imkoniyatlar" className="btn ghost lg">Imkoniyatlarni ko'rish</a>
            </div>
            <div className="hero-trust">
              <span>✓ Oflayn ishlaydi</span>
              <span>✓ Tez ulanish</span>
              <span>✓ O'zbek tilida</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="ph-top">
              <span className="ph-dot" /><span className="ph-dot" /><span className="ph-dot" />
            </div>
            <div className="ph-body">
              <div className="ph-scan">
                <div className="ph-laser" />
                <svg viewBox="0 0 24 24" fill="none" stroke="#0F6E78" strokeWidth="1.4">
                  <path d="M3 5v14M7 5v14M11 5v14M14 5v14M18 5v14M21 5v14" />
                </svg>
              </div>
              <div className="ph-line">
                <span>Coca-Cola 1L</span><b>12 000</b>
              </div>
              <div className="ph-line">
                <span>Non × 2</span><b>5 000</b>
              </div>
              <div className="ph-line muted">
                <span>Snickers</span><b>6 000</b>
              </div>
              <div className="ph-total">
                <span>Jami</span><b>23 000 so'm</b>
              </div>
              <div className="ph-pay">Sotish</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="imkoniyatlar">
        <div className="section-in">
          <span className="eyebrow center">Nega Chaqmoq</span>
          <h2 className="section-title">Raqobatchilardan ajratib turadigan narsalar</h2>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <div className="feat" key={f.title}>
                <div className="feat-ic">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="section alt" id="taqqoslash">
        <div className="section-in">
          <span className="eyebrow center">Taqqoslash</span>
          <h2 className="section-title">Chaqmoq vs an'anaviy tizimlar</h2>
          <div className="cmp">
            <div className="cmp-row cmp-head">
              <div>Imkoniyat</div>
              <div className="cmp-us">Chaqmoq</div>
              <div>An'anaviy</div>
            </div>
            {COMPARE.map((c) => (
              <div className="cmp-row" key={c[0]}>
                <div>{c[0]}</div>
                <div className="cmp-us">{c[1] ? <Tick /> : <Cross />}</div>
                <div>{c[2] ? <Tick muted /> : <Cross />}</div>
              </div>
            ))}
          </div>
          <p className="cmp-note">
            * Fiskal chek (OFD), Click/Payme/Uzum to'lov va markirovka (TURON) integratsiyalari
            ulanish uchun tayyor — yo'l xaritasida.
          </p>
        </div>
      </section>

      {/* Pricing — time-based, arranged directly with us */}
      <section className="section" id="narx">
        <div className="section-in">
          <span className="eyebrow center">Narx</span>
          <h2 className="section-title">Sodda va adolatli</h2>
          <p className="section-lead">
            Murakkab tariflar yo'q. Biz bilan bog'lanasiz, kerakli muddatga (masalan 1, 3, 6 yoki 12 oy)
            hisobingizni faollashtiramiz — hamma imkoniyatlar ochiq bo'ladi.
          </p>
          <div className="price-solo">
            <div className="ps-list">
              {["Kassa, ombor va hisobot", "Kamera bilan shtrix-kod skaner", "Nasiya, mijozlar va qarzlar", "Filiallar va foyda tahlili", "AI tahlilchi", "Barcha yangilanishlar"].map((x) => (
                <div className="ps-item" key={x}>{x}</div>
              ))}
            </div>
            <a href={TELEGRAM} target="_blank" rel="noreferrer" className="btn primary lg">Narxni bilish uchun bog'laning</a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-in">
          <h2>Bugun boshlang</h2>
          <p>Biz bilan bog'laning — hisobingizni ochib beramiz va yo'lga qo'yamiz.</p>
          <a href={TELEGRAM} target="_blank" rel="noreferrer" className="btn gold lg">Login olish uchun yozing</a>
        </div>
      </section>

      <footer className="lfoot">
        <div className="lfoot-in">
          <div className="lbrand">
            <span className="mark">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#FFE7A6" stroke="#FFE7A6" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </span>
            Chaqmoq
          </div>
          <span className="lfoot-copy">© {new Date().getFullYear()} Chaqmoq · O'zbekiston do'konlari uchun</span>
        </div>
      </footer>
    </div>
  );
}

const Tick = ({ muted }) => (
  <svg className={"tick" + (muted ? " muted" : "")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const Cross = () => (
  <svg className="cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const FEATURES = [
  {
    title: "Kamera bilan skanerlash",
    body: "Alohida skaner shart emas. Telefon kamerasiga ko'rsating — shtrix-kod o'qilib, mahsulot savatga o'zi tushadi.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M7 12h10" />
      </svg>
    ),
  },
  {
    title: "Offline-first",
    body: "Internet uzilganda ham kassa, qoldiq va asosiy funksiyalar ishlaydi. Aloqa qaytsa — avtomatik sinxron.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
      </svg>
    ),
  },
  {
    title: "Ko'p do'kon, bitta hisob",
    body: "Bir nechta filial yoki sotuvchi — har biri alohida ombor va hisobot. Hammasi bitta tizimda.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 21V7l6-4 6 4v14M9 21v-5h6v5M21 21V11l-6-4" />
      </svg>
    ),
  },
  {
    title: "Real vaqtli hisobot",
    body: "Tushum, sof foyda, o'rtacha chek va eng ko'p sotilganlar — telefoningizdan istalgan paytda.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    title: "Kam qoldiq ogohlantirishi",
    body: "Tovar tugashidan oldin tizim ogohlantiradi. Hech narsa kutilmaganda qolib ketmaydi.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    ),
  },
  {
    title: "Qonunchilikka tayyor",
    body: "Fiskal chek (OFD), Click/Payme/Uzum to'lov va markirovka (TURON) integratsiyalari ulanish uchun tayyorlangan.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

const COMPARE = [
  ["Telefon kamerasi bilan skanerlash", true, false],
  ["Internetsiz ishlash (offline)", true, false],
  ["O'zbek tilida interfeys", true, true],
  ["Bepul boshlang'ich tarif", true, false],
  ["Ko'p do'kon / multi-tenant", true, true],
  ["5 daqiqada o'rnatish", true, false],
];

