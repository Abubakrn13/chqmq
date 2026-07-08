import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
            <a href="#ekran">Ekran</a>
            <a href="#taqqoslash">Taqqoslash</a>
            <a href="#narx">Narxlar</a>
            <a href="#faq">FAQ</a>
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

      {/* Screenshots — device mockups of the actual panel */}
      <section className="section alt" id="ekran">
        <div className="section-in">
          <span className="eyebrow center">Ichini ko'ring</span>
          <h2 className="section-title">Panel qanday ko'rinadi</h2>
          <p className="section-lead">Do'kon egasi va sotuvchi bir vaqtda — kompyuter, planshet va telefondan foydalana oladi.</p>
          <div className="shots-grid">
            <div className="shot-card">
              <div className="shot-frame">
                <div className="shot-tab">Sotish</div>
                <div className="shot-body sell">
                  <div className="s-grid">
                    <div className="s-prod"><b>Coca-Cola</b><span>12 000</span></div>
                    <div className="s-prod"><b>Non</b><span>5 000</span></div>
                    <div className="s-prod"><b>Snickers</b><span>6 000</span></div>
                    <div className="s-prod"><b>Chips</b><span>8 000</span></div>
                  </div>
                  <div className="s-cart">
                    <div className="s-line"><span>Coca-Cola × 1</span><b>12 000</b></div>
                    <div className="s-line"><span>Non × 2</span><b>10 000</b></div>
                    <div className="s-total"><span>Jami</span><b>22 000 so'm</b></div>
                    <div className="s-btn">Sotish</div>
                  </div>
                </div>
              </div>
              <h4>Bir bosishda chek</h4>
              <p>Sotuvchi shtrix-kodni skanerlab, bir bosishda chek chiqaradi.</p>
            </div>

            <div className="shot-card">
              <div className="shot-frame">
                <div className="shot-tab">Boshqaruv paneli</div>
                <div className="shot-body dash">
                  <div className="d-kpis">
                    <div className="d-kpi teal"><span>Bugun</span><b>1.4 mln</b></div>
                    <div className="d-kpi green"><span>Foyda</span><b>420 K</b></div>
                    <div className="d-kpi gold"><span>Sotuv</span><b>47</b></div>
                    <div className="d-kpi anor"><span>Nasiya</span><b>85 K</b></div>
                  </div>
                  <div className="d-chart">
                    <div className="d-bar" style={{ height: "35%" }}></div>
                    <div className="d-bar" style={{ height: "55%" }}></div>
                    <div className="d-bar" style={{ height: "42%" }}></div>
                    <div className="d-bar" style={{ height: "78%" }}></div>
                    <div className="d-bar" style={{ height: "62%" }}></div>
                    <div className="d-bar" style={{ height: "88%" }}></div>
                    <div className="d-bar tall" style={{ height: "70%" }}></div>
                  </div>
                </div>
              </div>
              <h4>Real-time ko'rish</h4>
              <p>Direktor uydan turib har filial nima sotayotganini kuzatadi.</p>
            </div>

            <div className="shot-card">
              <div className="shot-frame">
                <div className="shot-tab">Filiallar</div>
                <div className="shot-body branches">
                  <div className="b-row"><div><b>Chilonzor</b><span>Yetakchi</span></div><div className="b-num">2.8 mln</div></div>
                  <div className="b-row"><div><b>Yunusobod</b><span>—</span></div><div className="b-num">1.9 mln</div></div>
                  <div className="b-row"><div><b>Sergeli</b><span>—</span></div><div className="b-num">1.4 mln</div></div>
                  <div className="b-add">+ Filial qo'shish</div>
                </div>
              </div>
              <h4>Har filialda alohida login</h4>
              <p>Menejer faqat o'z filialini ko'radi. Direktor esa hammasini birga.</p>
            </div>
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

      {/* Pricing — clear tiers so shopkeepers can decide without asking */}
      <section className="section" id="narx">
        <div className="section-in">
          <span className="eyebrow center">Narx</span>
          <h2 className="section-title">Sodda va adolatli</h2>
          <p className="section-lead">
            Yashirin to'lov yo'q. Bir marta to'lang — kerakli muddatgacha hamma imkoniyat ochiq.
          </p>
          <div className="price-tiers">
            <div className="ptier">
              <div className="ptier-head">
                <span className="ptier-lbl">1 oy sinov</span>
                <div className="ptier-price">300 <small>ming so'm</small></div>
                <div className="ptier-per">bir marta</div>
              </div>
              <ul className="ptier-list">
                <li>Barcha imkoniyatlar ochiq</li>
                <li>Bepul o'rnatib berish</li>
                <li>Xodimlarni o'rgatish</li>
                <li>Telegram orqali yordam</li>
              </ul>
              <a href={TELEGRAM} target="_blank" rel="noreferrer" className="btn ghost block">Boshlash</a>
            </div>
            <div className="ptier featured">
              <div className="ptier-badge">Ko'p tanlanadi</div>
              <div className="ptier-head">
                <span className="ptier-lbl">6 oy</span>
                <div className="ptier-price">1.5 <small>mln so'm</small></div>
                <div className="ptier-per">250 000 so'm / oy</div>
              </div>
              <ul className="ptier-list">
                <li>Barcha imkoniyatlar ochiq</li>
                <li>Bepul o'rnatib berish</li>
                <li>Xodimlarni o'rgatish</li>
                <li>Telegram orqali yordam</li>
                <li><b>Chegirma: 50 ming/oy</b></li>
              </ul>
              <a href={TELEGRAM} target="_blank" rel="noreferrer" className="btn primary block">Boshlash</a>
            </div>
            <div className="ptier">
              <div className="ptier-head">
                <span className="ptier-lbl">12 oy</span>
                <div className="ptier-price">2.5 <small>mln so'm</small></div>
                <div className="ptier-per">210 000 so'm / oy</div>
              </div>
              <ul className="ptier-list">
                <li>Barcha imkoniyatlar ochiq</li>
                <li>Bepul o'rnatib berish</li>
                <li>Xodimlarni o'rgatish</li>
                <li>Telegram orqali yordam</li>
                <li><b>2 oy tekin</b></li>
              </ul>
              <a href={TELEGRAM} target="_blank" rel="noreferrer" className="btn ghost block">Boshlash</a>
            </div>
          </div>
          <p className="price-note">
            Ikkinchi filial uchun +50%. Uchinchidan boshlab +30%. Kassa apparatura (printer, skaner) alohida.
          </p>
        </div>
      </section>

      {/* FAQ — the questions every shopkeeper asks first */}
      <section className="section alt" id="faq">
        <div className="section-in">
          <span className="eyebrow center">Ko'p so'ralgan savollar</span>
          <h2 className="section-title">Aniq javoblar</h2>
          <div className="faq-list">
            {FAQ.map((q, i) => <FaqItem key={i} q={q.q} a={q.a} />)}
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

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"faq-item" + (open ? " open" : "")}>
      <button className="faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

const FAQ = [
  {
    q: "Internetsiz ishlaydimi?",
    a: "Ha. Panel ochilgach oflaynda ham ochilaveradi. Sotuvni yozib olamiz, internet qaytganda avtomatik sinxronlanadi. Kassir uchun sotuv hech qachon to'xtamaydi.",
  },
  {
    q: "Ma'lumotim yo'qolib qolmaydimi?",
    a: "3 qatlamli himoya bor: server har yozuvda atomic write, har 10 daqiqada avtomatik zaxira, har kuni to'liq zaxira. Bundan tashqari har kun ertalab 9:00 da to'liq zaxira faylini sizga Telegram orqali jo'natamiz — telefondan har doim mavjud.",
  },
  {
    q: "Kassa apparatura kerakmi?",
    a: "Yo'q, faqat telefon yoki kompyuter bo'lsa yetadi. Shtrix-kodni telefon kamerasi bilan skanerlaymiz. Xohlasangiz USB shtrix-kod skaner (60-100 ming so'm) yoki 58mm chek printer (300-500 ming so'm) qo'shishingiz mumkin.",
  },
  {
    q: "OFD (soliq) bilan bog'lanadimi?",
    a: "Ha. sofd, mplus, myofd, solkassa provayderlari bilan integratsiya bor. O'rnatib berish paytida sizning fiskal hisobingizni ulaymiz.",
  },
  {
    q: "Payme va Click bilan to'lov qabul qilamanmi?",
    a: "Ha. Chek yakunida bir bosishda Payme yoki Click orqali to'lov havolasi yaratiladi va mijoz o'zi to'laydi. To'lov holati avtomatik yangilanadi.",
  },
  {
    q: "Nechta filialim bor bo'lsa qanday ishlaydi?",
    a: "Har filial alohida logini bilan alohida ishlaydi. Menejer faqat o'z filialining mahsulotlari va sotuvlarini ko'radi. Siz — direktor — hammasini birga yoki har filial alohida ko'rasiz. Tovarlarni filialar orasida bir bosishda o'tkazish mumkin.",
  },
  {
    q: "Xodimim pulini o'ziga olib qolsa ko'rmaymanmi?",
    a: "Ko'rasiz. Har kim, qachon, nima sotgani \"Faoliyat tarixi\" da yozilib qoladi. Katta chegirma bergan, kutilmagan vaqtda sotuv qilgan yoki ko'p qaytarish qilgan xodimlarni AI \"Shubhali sotuvlar\" bo'limida belgilaydi.",
  },
  {
    q: "O'rnatib berasizmi?",
    a: "Ha, bepul. Toshkent shahri ichida borib o'zimiz o'rnatib beramiz, mahsulotlaringizni Excel'dan import qilamiz, xodimlaringizga bir soatda o'rgatamiz. Boshqa viloyatlar uchun uzoqdan yordam ko'rsatamiz (screen share orqali).",
  },
];
