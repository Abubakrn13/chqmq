/* RoleGuard — client-side guard that hides a page from unauthorized users.
   Backend enforces the same rules; this just avoids showing forbidden UI
   when the URL is entered directly. */
import { useAuth } from "../auth.jsx";
import { PageHead } from "./ui.jsx";

export default function RoleGuard({ allow, children }) {
  const { user } = useAuth();
  const role = user?.role;
  const ok = Array.isArray(allow) ? allow.includes(role) : allow === role;
  if (ok) return children;
  return (
    <>
      <PageHead title="Ruxsat berilmagan" sub="Bu bo'limni ko'rish uchun ruxsatingiz yo'q" />
      <div className="card panel">
        <div className="empty" style={{ padding: 40 }}>
          <div style={{ fontSize: 46, marginBottom: 8 }}>🔒</div>
          <div>Bu sahifa faqat do'kon egasi uchun.</div>
          <div className="muted-xs" style={{ marginTop: 8 }}>Kerakli imkoniyat bo'lsa, do'kon egasidan so'rang.</div>
        </div>
      </div>
    </>
  );
}
