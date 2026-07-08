import { useEffect, useState } from "react";
import { api } from "../api.js";
import { money0, fmtDate, subActive, subDaysLeft, subEndsAt } from "../utils.js";
import { useToast } from "../toast.jsx";
import { useAuth } from "../auth.jsx";
import { Modal } from "../components/ui.jsx";

const ROLES = { owner: "Egasi", manager: "Menejer", cashier: "Sotuvchi" };

export default function SuperAdmin() {
  const toast = useToast();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("revenue");
  const [filter, setFilter] = useState("all"); // all | active | expired | inactive (never sold)
  const [act, setAct] = useState(null);
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const [reset, setReset] = useState(null);
  const [create, setCreate] = useState(false);
  const [created, setCreated] = useState(null);
  const [days, setDays] = useState(30);
  const NEW = { shopName: "", name: "", phone: "", password: "", days: 30 };
  const [cform, setCform] = useState(NEW);
  const [eform, setEform] = useState({ name: "", ownerPhone: "" });
  const [rform, setRform] = useState({ password: "" });

  async function load() {
    try {
      const url = `/superadmin/shops?sort=${sort}${q ? "&q=" + encodeURIComponent(q) : ""}`;
      setData(await api.get(url));
      setStats(await api.get("/superadmin/stats"));
    } catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [sort, q]);

  // Auto-refresh so day counters actually tick down as time passes.
  // Without this, a superadmin who leaves the page open sees stale counts.
  useEffect(() => {
    const t = setInterval(() => load(), 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [sort, q]);

  function openActivate(s) { setAct(s); setDays(30); }
  async function submitActivate() {
    try {
      await api.post(`/superadmin/shops/${act.id}/subscription`, { days: Number(days) || 0, status: "active" });
      toast(`${act.name}: ${days} kunga faollashtirildi`, "ok");
      setAct(null); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  async function quickExtend(s, n) {
    try {
      await api.post(`/superadmin/shops/${s.id}/extend`, { days: n });
      toast(`+${n} kun qo'shildi`, "ok"); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  async function toggleStatus(shop) {
    const next = subActive(shop.subscription) ? "suspended" : "active";
    try {
      await api.post(`/superadmin/shops/${shop.id}/subscription`, { status: next });
      toast(next === "active" ? "Faollashtirildi" : "To'xtatildi", "ok"); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  async function openDetail(s) {
    try { setDetail(await api.get("/superadmin/shops/" + s.id)); }
    catch (e) { toast(e.message, "warn"); }
  }
  function openEdit(s) {
    setEdit(s);
    setEform({ name: s.name, ownerPhone: s.owner?.phone || "" });
  }
  async function saveEdit() {
    try {
      if (eform.name !== edit.name) await api.put("/superadmin/shops/" + edit.id, { name: eform.name });
      if (eform.ownerPhone && eform.ownerPhone !== edit.owner?.phone)
        await api.put(`/superadmin/shops/${edit.id}/owner`, { phone: eform.ownerPhone });
      toast("Saqlandi", "ok"); setEdit(null); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  function openReset(s) { setReset(s); setRform({ password: "" }); }
  async function saveReset() {
    if (rform.password.length < 4) return toast("Parol kamida 4 belgi", "warn");
    try {
      await api.post(`/superadmin/shops/${reset.id}/reset-owner-password`, { password: rform.password });
      toast(`Yangi parol o'rnatildi. Login: ${reset.owner?.phone}, Parol: ${rform.password}`, "ok");
      setReset(null);
    } catch (e) { toast(e.message, "warn"); }
  }
  async function removeShop(s) {
    if (!confirm(`"${s.name}" do'koni to'liq o'chirilsinmi? Bu amal ortga qaytmaydi va do'konning barcha ma'lumotlari (sotuvlar, mahsulotlar, xodimlar) yo'qoladi.`)) return;
    const again = prompt(`Tasdiqlash uchun do'kon nomini yozing: ${s.name}`);
    if (again !== s.name) return toast("Bekor qilindi", "warn");
    try {
      await api.del("/superadmin/shops/" + s.id);
      toast("Do'kon o'chirildi", "ok"); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  function openCreate() { setCreated(null); setCform(NEW); setCreate(true); }
  async function submitCreate() {
    if (!cform.shopName.trim() || !cform.phone.trim() || !cform.password.trim())
      return toast("Do'kon nomi, login va parol majburiy", "warn");
    try {
      const r = await api.post("/superadmin/shops", { ...cform, days: Number(cform.days) || 0, status: "active" });
      setCreated({ shop: r.shop.name, phone: r.user.phone, password: cform.password });
      toast("Hisob yaratildi", "ok"); load();
    } catch (e) { toast(e.message, "warn"); }
  }

  return (
    <div className="super">
      <header className="super-top">
        <div className="brand">
          <div className="mark">
            <svg viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#FFE7A6" stroke="#FFE7A6" strokeWidth="1.2" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <div className="name">Chaqmoq · Platforma</div>
            <div className="tag">Superadmin boshqaruvi</div>
          </div>
        </div>
        <div className="spacer" />
        <button className="btn gold" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Yangi do'kon
        </button>
        <div className="cashier"><span className="av">SA</span>{user?.name || "Superadmin"}</div>
        <button className="logout inline" onClick={logout}>Chiqish</button>
      </header>

      <main className="super-body">
        {!data ? <div className="empty">Yuklanmoqda…</div> : (
          <>
            <div className="kpis">
              <div className="card kpi teal"><div className="klabel">Do'konlar</div><div className="kval num">{data.totals.shops}</div></div>
              <div className="card kpi green"><div className="klabel">Faol</div><div className="kval num">{data.totals.active}</div></div>
              <div className="card kpi anor"><div className="klabel">Muddati tugagan</div><div className="kval num">{data.totals.expired}</div></div>
              <div className="card kpi gold"><div className="klabel">Umumiy tushum</div><div className="kval num">{money0(data.totals.revenue)}<small>so'm</small></div></div>
            </div>

            {stats && stats.expiringSoon.length > 0 && (
              <div className="card panel warn-band">
                <b>⚠ Yaqin kunlarda muddati tugaydigan do'konlar ({stats.expiringSoon.length})</b>
                <div className="soon-list">
                  {stats.expiringSoon.map((x) => (
                    <span key={x.id} className="soon-pill">
                      {x.name} <b>{x.daysLeft} kun</b>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {stats && stats.topShops && stats.topShops.length > 0 && (
              <div className="card panel">
                <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Top do'konlar (oylik tushum bo'yicha)</h3>
                <div className="top-shops">
                  {stats.topShops.map((t, i) => (
                    <div key={t.id} className="top-shop">
                      <div className="ts-rank">#{i + 1}</div>
                      <div className="ts-name">{t.name}</div>
                      <div className="ts-rev">{money0(t.revenue)} <small>so'm</small></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card panel filters">
              <input className="search-input" placeholder="Do'kon yoki egasi bo'yicha izlash…" value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="cat-chips">
                {[["revenue", "Tushum"], ["monthRevenue", "Oylik tushum"], ["created", "Yangi"], ["active", "Faol"], ["name", "Nomi"]].map(([v, l]) => (
                  <button key={v} className={"chip" + (v === sort ? " active" : "")} onClick={() => setSort(v)}>{l}</button>
                ))}
              </div>
              <div className="cat-chips" style={{ marginTop: 8 }}>
                {[["all", "Barchasi"], ["active", "Faol"], ["expired", "Muddati tugagan"], ["silent", "Sotuvi yo'q"]].map(([v, l]) => (
                  <button key={v} className={"chip" + (v === filter ? " active" : "")} onClick={() => setFilter(v)}>{l}</button>
                ))}
              </div>
            </div>

            <div className="card">
              <table>
                <thead>
                  <tr><th>Do'kon</th><th>Egasi</th><th className="r">Filial</th><th className="r">Sotuv</th><th className="r">Umumiy tushum</th><th className="r">Oylik</th><th>Muddat</th><th>Holat</th><th className="r"></th></tr>
                </thead>
                <tbody>
                  {data.shops.filter((s) => {
                    // Apply status chip filter on top of the search/sort the API already did.
                    if (filter === "active") return subActive(s.subscription);
                    if (filter === "expired") return !subActive(s.subscription);
                    if (filter === "silent") return !s.salesCount || s.salesCount === 0;
                    return true;
                  }).map((s) => {
                    const okActive = subActive(s.subscription);
                    const dl = subDaysLeft(s.subscription);
                    const end = subEndsAt(s.subscription);
                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="tname">{s.name}</div>
                          <div className="tbarcode">{fmtDate(new Date(s.createdAt))}</div>
                        </td>
                        <td>{s.owner ? (<><div>{s.owner.name}</div><div className="tbarcode">{s.owner.phone}</div></>) : "—"}</td>
                        <td className="r num">{s.branches}</td>
                        <td className="r num">{s.salesCount}</td>
                        <td className="r num"><b>{money0(s.revenue)}</b></td>
                        <td className="r num">{money0(s.monthRevenue)}</td>
                        <td className="num">
                          {end ? (<>{fmtDate(new Date(end))}{okActive && dl != null ? <div className="muted-xs">{dl} kun qoldi</div> : null}</>) : "—"}
                        </td>
                        <td>
                          <button className={"pill " + (okActive ? "ok" : "out")} onClick={() => toggleStatus(s)} style={{ cursor: "pointer", border: "none" }}>
                            {okActive ? "Faol" : s.subscription.status === "suspended" ? "To'xtatilgan" : "Muddati tugagan"}
                          </button>
                        </td>
                        <td className="r">
                          <div className="rowact">
                            <button className="btn sm" onClick={() => quickExtend(s, 7)}>+7</button>
                            <button className="btn sm" onClick={() => quickExtend(s, 30)}>+30</button>
                            <button className="btn primary sm" onClick={() => openActivate(s)}>Muddat</button>
                            <button className="iconbtn" onClick={() => openDetail(s)} title="Batafsil">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            <button className="iconbtn" onClick={() => openEdit(s)} title="Tahrir">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
                            </button>
                            <button className="iconbtn" onClick={() => openReset(s)} title="Parol tiklash">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></svg>
                            </button>
                            <button className="iconbtn del" onClick={() => removeShop(s)} title="O'chirish">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!data.shops.length && <tr><td colSpan="9"><div className="empty">Hali do'konlar yo'q</div></td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {act && (
        <Modal title={`Muddat berish · ${act.name}`} onClose={() => setAct(null)} max="420px">
          <div className="f full"><label>Necha kunga faollashtirilsin?</label>
            <input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} autoFocus />
          </div>
          <div className="quick-days">
            {[7, 30, 90, 180, 365].map((d) => (
              <button key={d} className={"chip" + (Number(days) === d ? " active" : "")} onClick={() => setDays(d)}>{d} kun</button>
            ))}
          </div>
          <p className="modal-note">Faollashtirilgach do'kon paneli darhol ochiladi (avtomatik yangilanadi).</p>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setAct(null)}>Bekor</button>
            <button className="btn primary block" onClick={submitActivate}>Faollashtirish</button>
          </div>
        </Modal>
      )}

      {edit && (
        <Modal title={`Tahrirlash · ${edit.name}`} onClose={() => setEdit(null)} max="420px">
          <div className="f full"><label>Do'kon nomi</label>
            <input autoFocus value={eform.name} onChange={(e) => setEform({ ...eform, name: e.target.value })} />
          </div>
          <div className="f full"><label>Egasi logini (telefon)</label>
            <input value={eform.ownerPhone} onChange={(e) => setEform({ ...eform, ownerPhone: e.target.value })} />
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setEdit(null)}>Bekor</button>
            <button className="btn primary block" onClick={saveEdit}>Saqlash</button>
          </div>
        </Modal>
      )}

      {reset && (
        <Modal title={`Parol tiklash · ${reset.name}`} onClose={() => setReset(null)} max="380px">
          <p className="modal-note">Egasi uchun yangi parol o'rnatasiz. Login o'zgarmaydi: <b>{reset.owner?.phone}</b>.</p>
          <div className="f full"><label>Yangi parol</label>
            <input autoFocus value={rform.password} onChange={(e) => setRform({ password: e.target.value })} placeholder="kamida 4 belgi" />
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setReset(null)}>Bekor</button>
            <button className="btn primary block" onClick={saveReset}>Saqlash</button>
          </div>
        </Modal>
      )}

      {detail && (
        <Modal title={`Batafsil · ${detail.shop.name}`} onClose={() => setDetail(null)} max="720px">
          {/* Status + subscription strip on top */}
          <div className="detail-topstrip">
            <div className="dts-left">
              <div className={"status-pill " + (subActive(detail.shop.subscription) ? "ok" : "off")}>
                {subActive(detail.shop.subscription) ? "● Faol" : "● Muddat tugagan"}
              </div>
              {detail.shop.subscription?.activeUntil && (
                <div className="dts-sub">
                  <b>{subDaysLeft(detail.shop.subscription) ?? 0}</b> kun qoldi
                  <span className="muted-xs"> · {fmtDate(new Date(detail.shop.subscription.activeUntil))} gacha</span>
                </div>
              )}
            </div>
            <div className="dts-right">
              <button className="btn gold sm" onClick={() => { const s = detail.shop; setDetail(null); quickExtend(s, 7); }}>+7 kun</button>
              <button className="btn gold sm" onClick={() => { const s = detail.shop; setDetail(null); quickExtend(s, 30); }}>+30 kun</button>
              <button className="btn ghost sm" onClick={() => { const s = detail.shop; setDetail(null); setAct(s); }}>Muddat</button>
              <button className={"btn " + (subActive(detail.shop.subscription) ? "ghost" : "primary") + " sm"} onClick={() => toggleStatus(detail.shop)}>
                {subActive(detail.shop.subscription) ? "To'xtatish" : "Yoqish"}
              </button>
            </div>
          </div>

          {/* Owner block */}
          <div className="detail-owner">
            <div className="do-head">
              <div>
                <div className="do-lbl">Do'kon egasi</div>
                <div className="do-name">{detail.shop.owner?.name || "—"}</div>
                <div className="do-phone">📞 {detail.shop.owner?.phone || "—"}</div>
              </div>
              <div className="do-actions">
                <button className="btn ghost sm" onClick={() => { const s = detail.shop; setDetail(null); setEdit(s); }}>Nomni tahrirlash</button>
                <button className="btn ghost sm" onClick={() => { const s = detail.shop; setDetail(null); setReset(s); }}>Parol tiklash</button>
              </div>
            </div>
          </div>

          {/* KPI grid */}
          <div className="detail-grid">
            <div><span>Yaratilgan</span><b>{fmtDate(new Date(detail.shop.createdAt))}</b></div>
            <div><span>Umumiy tushum</span><b>{money0(detail.metrics.revenue)}</b></div>
            <div><span>Umumiy foyda</span><b>{money0(detail.metrics.profit)}</b></div>
            <div><span>Oylik tushum</span><b>{money0(detail.metrics.monthRevenue)}</b></div>
            <div><span>Sotuvlar</span><b>{detail.metrics.salesCount}</b></div>
            <div><span>Mahsulotlar</span><b>{detail.metrics.products}</b></div>
            <div><span>Mijozlar</span><b>{detail.metrics.customers}</b></div>
            <div><span>Filiallar</span><b>{detail.branches.length}</b></div>
          </div>

          <h4 style={{ marginTop: 18, marginBottom: 8 }}>Filiallar ({detail.branches.length})</h4>
          <div className="detail-list">
            {detail.branches.length ? detail.branches.map((b) => (
              <div key={b.id} className="dl-row">
                <b>{b.name}</b>
                <span>{b.address || "Manzil kiritilmagan"}</span>
              </div>
            )) : <div className="muted-xs">Filial yo'q</div>}
          </div>

          <h4 style={{ marginTop: 18, marginBottom: 8 }}>Xodimlar ({detail.users.length})</h4>
          <div className="detail-list">
            {detail.users.map((u) => (
              <div key={u.id} className="dl-row">
                <b>{u.name}</b>
                <span>{ROLES[u.role] || u.role} · {u.phone}</span>
              </div>
            ))}
          </div>

          <h4 style={{ marginTop: 18, marginBottom: 8 }}>So'nggi 10 sotuv</h4>
          <div className="detail-list">
            {detail.recent.length ? detail.recent.map((s) => (
              <div key={s.id} className="dl-row">
                <b>{money0(s.total)}</b>
                <span>{s.userName || "?"} · {s.pay || "Naqd"} · {fmtDate(new Date(s.ts))}</span>
              </div>
            )) : <div className="muted-xs">Sotuvlar yo'q</div>}
          </div>

          <div className="modal-foot" style={{ marginTop: 18 }}>
            <button className="btn ghost" onClick={() => setDetail(null)}>Yopish</button>
            <button className="btn anor" onClick={() => { const s = detail.shop; setDetail(null); removeShop(s); }}>Do'konni o'chirish</button>
          </div>
        </Modal>
      )}

      {create && (
        <Modal title="Yangi do'kon / login yaratish" onClose={() => setCreate(false)} max="470px">
          {created ? (
            <div className="cred-done">
              <div className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg></div>
              <h3>Hisob tayyor</h3>
              <p className="modal-note">Ushbu ma'lumotlarni do'kon egasiga bering:</p>
              <div className="cred-box">
                <div><span>Do'kon</span><b>{created.shop}</b></div>
                <div><span>Login (telefon)</span><b>{created.phone}</b></div>
                <div><span>Parol</span><b>{created.password}</b></div>
              </div>
              <div className="modal-foot">
                <button className="btn ghost" onClick={openCreate}>Yana yaratish</button>
                <button className="btn primary block" onClick={() => setCreate(false)}>Yopish</button>
              </div>
            </div>
          ) : (
            <>
              <div className="f full"><label>Do'kon nomi</label><input autoFocus value={cform.shopName} onChange={(e) => setCform({ ...cform, shopName: e.target.value })} placeholder="Barakali Do'kon" /></div>
              <div className="f full"><label>Egasi ismi</label><input value={cform.name} onChange={(e) => setCform({ ...cform, name: e.target.value })} placeholder="Ism (ixtiyoriy)" /></div>
              <div className="fgrid">
                <div className="f"><label>Login (telefon)</label><input value={cform.phone} onChange={(e) => setCform({ ...cform, phone: e.target.value })} placeholder="998 90 ..." /></div>
                <div className="f"><label>Parol</label><input value={cform.password} onChange={(e) => setCform({ ...cform, password: e.target.value })} placeholder="kamida 4 belgi" /></div>
                <div className="f full"><label>Muddat (kun)</label><input type="number" min="1" value={cform.days} onChange={(e) => setCform({ ...cform, days: e.target.value })} /></div>
              </div>
              <div className="modal-foot">
                <button className="btn ghost" onClick={() => setCreate(false)}>Bekor</button>
                <button className="btn primary block" onClick={submitCreate}>Yaratish</button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
