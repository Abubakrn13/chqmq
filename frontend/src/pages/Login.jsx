import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";
import { TELEGRAM } from "../utils.js";

const LAST_KEY = "chaqmoq.lastPhone";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ phone: "", password: "" });

  // Pre-fill the phone the user last logged in with — one less thing to type.
  useEffect(() => {
    const last = localStorage.getItem(LAST_KEY);
    if (last) setF((s) => ({ ...s, phone: last }));
  }, []);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  async function submit() {
    if (!f.phone || !f.password) return toast("Telefon va parolni kiriting", "warn");
    setBusy(true);
    try {
      const u = await login(f.phone, f.password);
      localStorage.setItem(LAST_KEY, f.phone);
      nav(u?.role === "superadmin" ? "/superadmin" : "/panel/dashboard");
    } catch (e) {
      toast(e.message, "warn");
    }
    setBusy(false);
  }

  return (
    <div className="auth">
      <div className="auth-art">
        <Link to="/" className="auth-brand">
          <span className="mark">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#FFE7A6" stroke="#FFE7A6" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </span>
          Chaqmoq
        </Link>
        <div className="auth-art-body">
          <h1>Do'koningiz — kaftingizda</h1>
          <p>Kassa, ombor va hisobot bir joyda. Internet uzilsa ham sotuv to'xtamaydi.</p>
          <ul className="auth-feats">
            <li>Kamera bilan shtrix-kod skanerlash</li>
            <li>Real vaqtda qoldiq va foyda</li>
            <li>Bir nechta filial — bitta hisob</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <h2 className="auth-title">Hisobingizga kiring</h2>
          <p className="auth-lead">Login va parol biz tomonidan beriladi.</p>

          <div className="f">
            <label>Telefon raqami</label>
            <input
              value={f.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="998 90 123 45 67"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div className="f">
            <label>Parol</label>
            <input
              type="password"
              value={f.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          <button className="btn primary lg block" disabled={busy} onClick={submit}>
            {busy ? "Kirilmoqda…" : "Kirish"}
          </button>

          <div className="auth-divider"><span>Hisobingiz yo'qmi?</span></div>

          <a className="btn ghost lg block tg" href={TELEGRAM} target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 3 2 10.5l6 2L18 6l-7.5 8.5.4 6L14 16l4.5 3.2L22 3Z" /></svg>
            Login olish uchun bizga yozing
          </a>
          <p className="auth-foot">Telegram orqali murojaat qiling — hisobingizni ochib beramiz.</p>
        </div>
      </div>
    </div>
  );
}
