import { useState, useRef, useEffect } from "react";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";
import { PageHead } from "../components/ui.jsx";

const SUGGESTIONS = [
  "Umumiy tahlil qilib ber",
  "Qanday sotaman?",
  "Nasiya nima?",
  "Foydani qanday oshirsam bo'ladi?",
  "Nima ko'p sotildi?",
  "Qaysi mahsulot sotilmayapti?",
  "Qarzlar holati qanday?",
  "Filial qanday qo'shaman?",
];

export default function AiAnalyst() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages, busy]);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const d = await api.post("/ai/chat", { messages: next });
      setMessages([...next, { role: "assistant", content: d.reply }]);
    } catch (e) {
      toast(e.message, "warn");
    }
    setBusy(false);
  }

  return (
    <>
      <PageHead title="AI yordamchi" sub="Do'kon tahlili + sayt bo'yicha yo'riqnoma" />
      <div className="card ai-chat">
        <div className="ai-messages" ref={listRef}>
          {messages.length === 0 && (
            <div className="ai-empty">
              <div className="ai-orb">✨</div>
              <b>Sizga qanday yordam beray?</b>
              <span>Biznes tahlili yoki sayt bo'yicha savol yozing</span>
              <div className="ai-suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={"ai-msg " + m.role}>
              <div className="ai-bubble">{m.content}</div>
            </div>
          ))}
          {busy && (
            <div className="ai-msg assistant">
              <div className="ai-bubble typing"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>
        <div className="ai-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Savolingizni yozing…"
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="btn primary" disabled={busy || !input.trim()} onClick={() => send()}>
            Yuborish
          </button>
        </div>
      </div>
      <p className="modal-note" style={{ marginTop: 10 }}>
        Tahlil do'koningiz ma'lumotlari asosida avtomatik hisoblanadi.
      </p>
    </>
  );
}
