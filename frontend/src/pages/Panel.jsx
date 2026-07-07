import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth.jsx";
import { api } from "../api.js";
import { fmtDate, subActive, subDaysLeft, TELEGRAM } from "../utils.js";
import InstallButton from "../components/InstallButton.jsx";

const I = {
  dash: <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6ZM13 9h8V3h-8v6Z" />,
  sell: (<><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M3 9h18M7 21h10" /></>),
  today: (<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4M8 14h4" /></>),
  products: (<><path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z" /><path d="M3 7l9 4 9-4M12 11v10" /></>),
  ret: <path d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" />,
  customers: (<><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M21 20a5 5 0 0 0-4-4.9" /></>),
  debts: (<><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></>),
  profit: <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" />,
  arenda: (<><path d="M3 21V7l9-4 9 4v14" /><path d="M9 21v-6h6v6M3 21h18" /></>),
  branches: <path d="M6 3v6M18 3v6M6 9a6 6 0 0 0 12 0M12 15v6M8 21h8" />,
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 2h-5l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L3 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h5l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z" /></>),
  ai: (<><path d="M12 3l1.7 4 4 1.7-4 1.7L12 14l-1.7-4-4-1.7 4-1.7L12 3Z" /><path d="M18.5 14l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" /></>),
  staff: (<><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0M17 11a3 3 0 0 0 0-6M22 20a5 5 0 0 0-3-4.5" /></>),
  shifts: (<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M8 14h3M14 14h3M8 17h3" /></>),
  suppliers: (<><path d="M3 7h14l3 4v6h-3M3 7v10h14V7M3 17h1M17 17h1" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>),
  invoices: (<><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 12h6M9 16h6" /></>),
  telegram: <path d="M22 3 2 10.5l6 2L18 6l-7.5 8.5.4 6L14 16l4.5 3.2L22 3Z" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
};
const Ic = ({ d }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">{d}</svg>);

const GROUPS = [
  ["Asosiy", [["dashboard", "Boshqaruv paneli", "dash"], ["sell", "Sotish", "sell"], ["today", "Bugungi sotuvlar", "today"], ["shifts", "Kassa smenasi", "shifts"]]],
  ["Ombor & savdo", [["products", "Mahsulotlar", "products"], ["invoices", "Faktura (kirim)", "invoices"], ["suppliers", "Yetkazib beruvchilar", "suppliers"], ["audit", "Inventarizatsiya", "products"], ["transfers", "Filiallar orasi", "branches"], ["reorder", "Buyurtma", "invoices"], ["return", "Qaytarish", "ret"]]],
  ["Mijozlar", [["customers", "Mijozlar", "customers"], ["debts", "Qarzlar", "debts"]]],
  ["Moliya", [["profit", "Foyda", "profit"], ["arenda", "Arenda", "arenda"], ["ai", "AI yordamchi", "ai"]]],
  ["Boshqaruv", [["branches", "Filiallar", "branches"], ["staff", "Xodimlar", "staff"], ["performance", "Samaradorlik", "profit"], ["targets", "Maqsadlar", "profit"], ["suspicious", "Shubhali sotuvlar", "clock"], ["activity", "Faoliyat tarixi", "clock"], ["telegram", "Telegram", "telegram"], ["settings", "Sozlamalar", "settings"]]],
];

const BKEY = "chaqmoq.branch";

export default function Panel() {
  const { user, shop, logout, refresh } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  // First-run onboarding: owner without a completed profile is redirected
  // to /panel/onboarding. Cashiers/managers skip this step.
  useEffect(() => {
    if (user?.role === "owner" && shop && !shop.profileCompletedAt && location.pathname !== "/panel/onboarding") {
      nav("/panel/onboarding", { replace: true });
    }
  }, [user, shop, location.pathname, nav]);
  const [online, setOnline] = useState(navigator.onLine);
  const [menuOpen, setMenuOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(() => localStorage.getItem(BKEY) || "");

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Keep subscription status fresh: poll periodically and re-check the moment
  // any API call reports the subscription is inactive (HTTP 402).
  useEffect(() => {
    const safeRefresh = () => refresh?.().catch(() => {});
    const t = setInterval(safeRefresh, 30000);
    const onInactive = () => safeRefresh();
    window.addEventListener("chaqmoq:sub-inactive", onInactive);
    return () => {
      clearInterval(t);
      window.removeEventListener("chaqmoq:sub-inactive", onInactive);
    };
  }, [refresh]);

  const reloadBranches = useCallback(async () => {
    try {
      const list = await api.get("/branches");
      setBranches(list);
      setBranchId((cur) => {
        // Users locked to a branch always use theirs; others default to "all".
        if (user?.branchId) return user.branchId;
        const valid = cur && list.some((b) => b.id === cur);
        return valid ? cur : "";
      });
    } catch (e) {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    if (subActive(shop?.subscription)) reloadBranches();
  }, [shop, reloadBranches]);

  function pickBranch(id) {
    setBranchId(id);
    if (id) localStorage.setItem(BKEY, id);
    else localStorage.removeItem(BKEY);
  }

  const initials = (shop?.name || "Do'kon").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const daysLeft = subDaysLeft(shop?.subscription);
  const active = subActive(shop?.subscription);

  return (
    <div className="app">
      <aside className={"side wide" + (menuOpen ? " open" : "")}>
        <div className="brand">
          <div className="mark">
            <svg viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#FFE7A6" stroke="#FFE7A6" strokeWidth="1.2" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <div className="name">Chaqmoq</div>
            <div className="tag">{shop?.name || "Sotuvchi paneli"}</div>
          </div>
        </div>

        <nav className="nav scroll" onClick={() => setMenuOpen(false)}>
          {GROUPS.map(([title, items]) => {
            // Cashiers only see the operational parts of the panel.
            // Owners see everything. Managers see operational + inventory.
            // Cashiers see only the sell-side of the panel.
            const cashierAllowed = new Set(["dashboard", "sell", "today", "shifts", "products", "return", "customers", "debts", "targets"]);
            const managerAllowed = new Set([
              "dashboard", "sell", "today", "shifts",
              "products", "invoices", "suppliers", "audit", "transfers", "reorder", "return",
              "customers", "debts", "targets",
            ]);
            let visible = items;
            if (user?.role === "cashier") visible = items.filter(([to]) => cashierAllowed.has(to));
            else if (user?.role === "manager") visible = items.filter(([to]) => managerAllowed.has(to));
            if (!visible.length) return null;
            return (
              <div className="nav-group" key={title}>
                <div className="nav-title">{title}</div>
                {visible.map(([to, label, ic]) => (
                  <NavLink key={to} to={"/panel/" + to}>
                    <Ic d={I[ic]} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="side-foot">
          <button className="plan-pill" onClick={() => { setMenuOpen(false); nav("/panel/settings"); }}>
            <span>{daysLeft != null ? `Muddat: ${daysLeft} kun` : "Muddat"}</span>
            <b>Boshqarish</b>
          </button>
          <div className={"netpill" + (online ? "" : " off")}>
            <span className="dot" />
            <span>{online ? "Onlayn" : "Offline rejim"}</span>
          </div>
          <button className="logout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
            Chiqish
          </button>
        </div>
      </aside>

      {menuOpen && <div className="side-backdrop" onClick={() => setMenuOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menyu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="shop">
            <span>{shop?.name || "Do'kon"}</span>
            <small>Sotuvchi paneli</small>
          </div>
          {active && branches.length > 0 && !user?.branchId && (
            <label className="branch-switch" title="Joriy filial">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 3v6M18 3v6M6 9a6 6 0 0 0 12 0M12 15v6M8 21h8" /></svg>
              <select value={branchId} onChange={(e) => pickBranch(e.target.value)}>
                {/* Owner/manager without a branchId in their token can view all branches */}
                <option value="">Barcha filiallar</option>
                {branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>
            </label>
          )}
          <div className="spacer" />
          <div className="date">{fmtDate(new Date())}</div>
          <InstallButton />
          <div className="cashier">
            <span className="av">{initials}</span>
            {user?.name || "Sotuvchi"}
          </div>
        </header>
        <main className="view">
          {active ? (
            <Outlet context={{ branchId, branches, reloadBranches }} />
          ) : (
            <Locked shop={shop} />
          )}
        </main>
      </div>
    </div>
  );
}

/* Shown when the subscription is not active (trial expired or suspended).
   Auto-checks every 15s and on focus, so superadmin activation unlocks it
   immediately without a manual reload. */
function Locked({ shop }) {
  const { refresh, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const sub = shop?.subscription || {};
  const suspended = sub.status === "suspended";

  const check = useCallback(async () => {
    setChecking(true);
    try {
      await refresh();
    } catch (e) {
      /* ignore */
    }
    setChecking(false);
  }, [refresh]);

  useEffect(() => {
    const t = setInterval(check, 15000);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [check]);

  return (
    <div className="locked">
      <div className="locked-card card">
        <div className="locked-ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        </div>
        <h2>{suspended ? "Do'kon to'xtatilgan" : "Muddat tugadi"}</h2>
        <p>
          Do'koningizni ishlatishda davom etish uchun muddatni uzaytiring.
          To'lovni kelishib olgach, do'koningiz <b>darhol</b> ochiladi.
        </p>
        <div className="locked-actions">
          <a className="btn primary lg" href={TELEGRAM} target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 3 2 10.5l6 2L18 6l-7.5 8.5.4 6L14 16l4.5 3.2L22 3Z" /></svg>
            Telegram orqali faollashtirish
          </a>
          <button className="btn ghost lg" onClick={check} disabled={checking}>
            {checking ? "Tekshirilmoqda…" : "Holatni tekshirish"}
          </button>
        </div>
        <button className="linklike" onClick={logout}>Chiqish</button>
      </div>
    </div>
  );
}
