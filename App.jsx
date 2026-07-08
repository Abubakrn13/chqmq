import { useEffect, useState, useRef } from "react";
import { api, getToken } from "../api.js";
import { money0, fmtTime } from "../utils.js";

const LABEL = {
  sale: "Sotuv",
  return: "Qaytarish",
  "shift-open": "Smena ochildi",
  "shift-close": "Smena yopildi",
  invoice: "Faktura",
  "debt-pay": "Qarz to'lovi",
};
const TONE = {
  sale: "ok",
  return: "warn",
  "shift-open": "info",
  "shift-close": "info",
  invoice: "gold",
  "debt-pay": "ok",
};

// A compact live feed of shop events. Uses SSE to receive updates in
// real time; also loads a recent snapshot on first render so the panel
// isn't empty when a manager just opened it.
export default function LiveFeed() {
  const [events, setEvents] = useState([]);
  const [live, setLive] = useState(false);
  const esRef = useRef(null);

  useEffect(() => {
    let alive = true;
    let es = null;
    (async () => {
      try { setEvents(await api.get("/live/recent")); } catch (e) { /* ignore */ }
      // Request a short-lived ticket rather than putting the session token
      // in the URL. Tickets expire in 5 minutes and only work for /live.
      let ticket;
      try { ticket = (await api.post("/live/ticket")).ticket; }
      catch (e) { return; }
      if (!alive) return;
      es = new EventSource("/api/live/stream?t=" + encodeURIComponent(ticket));
      esRef.current = es;
      es.onopen = () => setLive(true);
      es.onerror = () => setLive(false);
      es.onmessage = (m) => {
        try {
          const ev = JSON.parse(m.data);
          setEvents((s) => [ev, ...s].slice(0, 30));
        } catch (e) { /* ignore */ }
      };
    })();
    return () => { alive = false; try { es && es.close(); } catch {} esRef.current = null; };
  }, []);

  return (
    <div className="card panel live-feed">
      <div className="live-head">
        <h3>Jonli faoliyat</h3>
        <span className={"live-dot" + (live ? " on" : "")} title={live ? "Ulangan" : "Ulanish yo'q"}></span>
      </div>
      <div className="sub">Xodimlar harakati real vaqtda</div>
      {!events.length ? (
        <div className="empty">Hozircha faoliyat yo'q. Sotuv qilinganda shu yerda ko'rinadi.</div>
      ) : (
        <div className="live-list">
          {events.map((e, i) => (
            <div className={"live-row " + (TONE[e.type] || "info")} key={i}>
              <div className="live-time">{fmtTime(e.at)}</div>
              <div className="live-body">
                <div className="live-user">{e.user}</div>
                <div className="live-what">
                  {LABEL[e.type] || e.type}
                  {e.total != null && <> · <b>{money0(e.total)}</b></>}
                  {e.amount != null && e.total == null && <> · <b>{money0(e.amount)}</b></>}
                  {e.itemCount != null && <> · {e.itemCount} dona</>}
                  {e.pay && <> · {e.pay}</>}
                  {e.diff != null && <> · farq {e.diff >= 0 ? "+" : ""}{money0(e.diff)}</>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
