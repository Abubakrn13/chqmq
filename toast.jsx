import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

/* Formats found on real product packaging in UZ shops (+ QR). */
const FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.QR_CODE,
];

const REGION_ID = "chaqmoq-scan-region";

/* Short beep so the cashier hears a successful scan without looking. */
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.07;
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 110);
  } catch (e) {
    /* audio not available — ignore */
  }
}

export default function Scanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const lastRef = useRef({ code: "", at: 0 });
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");
  const [count, setCount] = useState(0);
  const [last, setLast] = useState("");

  useEffect(() => {
    const html5 = new Html5Qrcode(REGION_ID, { formatsToSupport: FORMATS, verbose: false });
    scannerRef.current = html5;
    let stopped = false;

    function handle(decodedText) {
      const now = Date.now();
      // Ignore the same code re-read within 1.4s (cameras fire many frames).
      if (lastRef.current.code === decodedText && now - lastRef.current.at < 1400) return;
      lastRef.current = { code: decodedText, at: now };
      beep();
      setLast(decodedText);
      setCount((c) => c + 1);
      onDetected(decodedText);
    }

    html5
      .start(
        { facingMode: "environment" },
        { fps: 12, qrbox: { width: 260, height: 170 }, aspectRatio: 1.4 },
        handle,
        () => {} // per-frame "not found" — noisy, ignore
      )
      .catch((err) => {
        setError(
          "Kameraga ruxsat berilmadi yoki kamera topilmadi. Pastdan shtrix-kodni qo'lda kiriting."
        );
      });

    return () => {
      stopped = true;
      const s = scannerRef.current;
      if (s) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitManual() {
    const code = manual.trim();
    if (!code) return;
    setLast(code);
    setCount((c) => c + 1);
    onDetected(code);
    setManual("");
  }

  return (
    <div className="overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal scanner-modal">
        <div className="modal-head">
          <h3>Shtrix-kod skaneri</h3>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {!error && (
            <p className="scan-hint">Mahsulot shtrix-kodini kameraga ko'rsating — avtomatik qo'shiladi</p>
          )}
          <div className="scan-frame">
            <div id={REGION_ID} />
            {!error && <div className="scan-laser" />}
          </div>

          {error && <div className="scan-error">{error}</div>}

          <div className="scan-status">
            {count > 0 ? (
              <span>
                <b>{count}</b> ta skanerlandi · oxirgi: <code>{last}</code>
              </span>
            ) : (
              <span>Tayyor — skanerlashni boshlang</span>
            )}
          </div>

          <div className="scan-manual">
            <input
              placeholder="Yoki shtrix-kodni qo'lda kiriting…"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitManual()}
            />
            <button className="btn" onClick={submitManual}>
              Qo'shish
            </button>
          </div>

          <button className="btn primary block" onClick={onClose}>
            Tayyor
          </button>
        </div>
      </div>
    </div>
  );
}
