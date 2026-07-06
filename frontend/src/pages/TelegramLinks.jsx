import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";
import { PageHead, Modal } from "../components/ui.jsx";

export default function TelegramLinks() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState(null); // { configured: bool }
  const [open, setOpen] = useState(false);
  const [howto, setHowto] = useState(false);
  const [f, setF] = useState({ chatId: "", name: "" });
  const [lastError, setLastError] = useState(null);

  async function load() {
    try {
      setRows(await api.get("/telegram"));
      setStatus(await api.get("/telegram/status"));
    } catch (e) { toast(e.message, "warn"); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function link() {
    if (!f.chatId.trim()) return toast("chat_id kerak", "warn");
    try {
      await api.post("/telegram/link", f);
      toast("Bog'landi", "ok"); setOpen(false); setF({ chatId: "", name: "" }); load();
    } catch (e) { toast(e.message, "warn"); }
  }
  async function unlink(x) {
    if (!confirm("O'chirilsinmi?")) return;
    try { await api.del("/telegram/" + x.id); load(); } catch (e) { toast(e.message, "warn"); }
  }
  async function testSend() {
    if (!rows.length) return toast("Avval chatni bog'lang", "warn");
    setLastError(null);
    try {
      const r = await api.post("/telegram/test");
      const okCnt = r.results.filter((x) => x.ok).length;
      const failed = r.results.filter((x) => !x.ok);
      if (okCnt === r.results.length) {
        toast(`Yuborildi ${okCnt}/${r.results.length}`, "ok");
      } else {
        // Show the exact error so the user can fix it.
        const err = failed.map((x) => `chat_id ${x.chatId}: ${x.error}`).join("\n");
        setLastError(err);
        toast(`Yuborilmadi: ${failed[0]?.error || "noma'lum xato"}`, "warn");
      }
    } catch (e) { toast(e.message, "warn"); }
  }
  async function sendBackupNow() {
    if (!rows.length) return toast("Avval chatni bog'lang", "warn");
    setLastError(null);
    try {
      const r = await api.post("/telegram/backup");
      const okCnt = r.results.filter((x) => x.ok).length;
      const failed = r.results.filter((x) => !x.ok);
      if (okCnt === r.results.length) {
        toast(`Zaxira yuborildi ${okCnt}/${r.results.length}`, "ok");
      } else {
        setLastError(failed.map((x) => `chat_id ${x.chatId}: ${x.error}`).join("\n"));
        toast(`Yuborilmadi: ${failed[0]?.error || "noma'lum xato"}`, "warn");
      }
    } catch (e) { toast(e.message, "warn"); }
  }

  return (
    <>
      <PageHead title="Telegram bot" sub="Har kuni ertalab hisobot va kam qoldiq xabarlari">
        <button className="btn" onClick={() => setHowto(true)}>Qanday ulanadi?</button>
        <button className="btn" onClick={testSend}>Sinov xabar</button>
        <button className="btn" onClick={sendBackupNow}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
          Zaxira yuborish
        </button>
        <button className="btn primary" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Chatni bog'lash
        </button>
      </PageHead>

      <div className="card panel info-band">
        <b>🛡 Ma'lumot xavfsizligi</b>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink)" }}>
          Har kuni ertalab soat 9:00 da tizim to'liq zaxirani (JSON fayl) bog'langan Telegram chatlarga avtomatik jo'natadi. Bu fayllarni saqlab qo'ying — kerak bo'lganda ular orqali ma'lumotni tiklash mumkin. Shu bilan bir qatorda backend har 10 daqiqada avtomatik zaxira faylini yozadi va agar ma'lumot bazasi buzilsa avtomatik tiklaydi.
        </p>
      </div>

      {status && !status.configured && (
        <div className="card panel warn-band">
          <b>⚠ Server tomonda Telegram bot tokeni sozlanmagan</b>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink)" }}>
            Bot yaratib, <code>TELEGRAM_BOT_TOKEN</code> ni server sozlamalarga qo'shish kerak. "Qanday ulanadi?" tugmasini bosing.
          </p>
        </div>
      )}

      {lastError && (
        <div className="card panel warn-band" style={{ marginTop: 10 }}>
          <b>Xabar yuborilmadi</b>
          <pre style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--anor)", whiteSpace: "pre-wrap" }}>{lastError}</pre>
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Nomi</th><th>chat_id</th><th>Holat</th><th className="r"></th></tr></thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id}>
                <td className="tname">{x.name || "Chat"}</td>
                <td className="num">{x.chatId}</td>
                <td>{x.enabled ? <span className="pill ok">Faol</span> : <span className="pill out">O'chirilgan</span>}</td>
                <td className="r"><button className="iconbtn del" onClick={() => unlink(x)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="4"><div className="empty">Bog'langan chatlar yo'q</div></td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Telegram chatni bog'lash" onClose={() => setOpen(false)} max="400px">
          <div className="f full"><label>chat_id</label>
            <input autoFocus value={f.chatId} onChange={(e) => setF({ ...f, chatId: e.target.value })} placeholder="Masalan: 123456789" />
          </div>
          <div className="f full"><label>Nomi (ixtiyoriy)</label>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Bek — direktor" />
          </div>
          <p className="modal-note">chat_id ni bilmaysizmi? "Qanday ulanadi?" tugmasini bosing — batafsil yo'riqnoma ochiladi.</p>
          <div className="modal-foot">
            <button className="btn ghost" onClick={() => setOpen(false)}>Bekor</button>
            <button className="btn primary block" onClick={link}>Bog'lash</button>
          </div>
        </Modal>
      )}

      {howto && (
        <Modal title="Telegram botni ulash — to'liq yo'riqnoma" onClose={() => setHowto(false)} max="560px">
          <div className="howto">
            <div className="ht-step">
              <div className="ht-num">1</div>
              <div>
                <b>Bot yarating (bir marta)</b>
                <p>Telegramda <a href="https://t.me/BotFather" target="_blank" rel="noreferrer"><b>@BotFather</b></a> ga kiring va <code>/newbot</code> yuboring. Nom bering (masalan "Do'konim boti"), keyin username bering (oxiri <code>bot</code> bilan tugashi kerak, masalan <code>mendokonim_bot</code>). BotFather sizga <b>token</b> beradi — uzun satr, masalan <code>7891234567:AAG-xxx...</code></p>
              </div>
            </div>

            <div className="ht-step">
              <div className="ht-num">2</div>
              <div>
                <b>Tokenni serverga qo'ying</b>
                <p>Bu tokenni bir marta biz bilan bog'lanib bering — server sozlamalariga qo'yamiz. Yoki agar o'zingiz Railway'da boshqarayotgan bo'lsangiz, <code>TELEGRAM_BOT_TOKEN</code> nomi bilan Variables ga qo'shing va deploy qiling.</p>
              </div>
            </div>

            <div className="ht-step">
              <div className="ht-num">3</div>
              <div>
                <b>Har kim botga /start yuborsin</b>
                <p>Har kim (siz, menejer, direktor) botni Telegramda ochib <b>/start</b> tugmasini bir marta bossin. Aks holda bot ularga xabar yubora olmaydi.</p>
              </div>
            </div>

            <div className="ht-step">
              <div className="ht-num">4</div>
              <div>
                <b>chat_id ni oling</b>
                <p>Telegramda <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer"><b>@userinfobot</b></a> ga kiring va <code>/start</code> yuboring — u sizga <b>Id</b> (chat_id) ni beradi. Masalan: <code>123456789</code>.</p>
              </div>
            </div>

            <div className="ht-step">
              <div className="ht-num">5</div>
              <div>
                <b>Shu yerga bog'lang</b>
                <p>"Chatni bog'lash" tugmasini bosib chat_id ni kiriting. Keyin "Sinov xabar" bosing — Telegramga xabar keladi. Kelmasa, xato aniq yoziladi.</p>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn primary block" onClick={() => setHowto(false)}>Tushundim</button>
          </div>
        </Modal>
      )}
    </>
  );
}
