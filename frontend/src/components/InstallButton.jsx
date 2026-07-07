/* InstallButton — persistent PWA install button that lives in the panel
   header. Complements the auto-shown InstallPrompt: on browsers where
   the auto-prompt never fires (iOS Safari; Android without engagement
   heuristics met), the user can still install from here. */
import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [howto, setHowto] = useState(false);

  useEffect(() => {
    // Already running as an installed PWA — hide the button.
    if (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone) {
      setInstalled(true);
      return;
    }
    // iOS Safari doesn't fire beforeinstallprompt; we show a "how-to" instead.
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) setIsIOS(true);

    function onPrompt(e) {
      e.preventDefault();
      setDeferred(e);
    }
    function onInstalled() { setInstalled(true); setDeferred(null); }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch {}
      setDeferred(null);
    } else {
      // Neither Chrome auto-prompt nor iOS — show manual instructions.
      setHowto(true);
    }
  }

  return (
    <>
      <button className="btn ghost sm install-btn" onClick={install} title="Ilova qilib o'rnatish">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
        <span className="ib-lbl">O'rnatish</span>
      </button>

      {howto && (
        <div className="overlay show" onClick={(e) => e.target === e.currentTarget && setHowto(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-head">
              <h3>Ilova sifatida o'rnatish</h3>
              <button className="x" onClick={() => setHowto(false)}>×</button>
            </div>
            <div className="modal-body">
              {isIOS ? (
                <div className="howto">
                  <div className="ht-step">
                    <div className="ht-num">1</div>
                    <div>
                      <b>Safari'da pastdagi ulashish tugmasini bosing</b>
                      <p>Ekran pastida <b>⬆︎</b> (kvadrat ichida strelka) tugmasi bor.</p>
                    </div>
                  </div>
                  <div className="ht-step">
                    <div className="ht-num">2</div>
                    <div>
                      <b>"Add to Home Screen" ni tanlang</b>
                      <p>Menyu pastga tushirsangiz "Bosh ekranga qo'shish" varianti chiqadi.</p>
                    </div>
                  </div>
                  <div className="ht-step">
                    <div className="ht-num">3</div>
                    <div>
                      <b>"Add" bosing</b>
                      <p>Bosh ekranda Chaqmoq iconi paydo bo'ladi. Bir bosishda ochiladi.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="howto">
                  <div className="ht-step">
                    <div className="ht-num">1</div>
                    <div>
                      <b>Brauzer menyusidan foydalaning</b>
                      <p>Yuqori o'ng burchakda <b>⋮</b> tugmasini bosing.</p>
                    </div>
                  </div>
                  <div className="ht-step">
                    <div className="ht-num">2</div>
                    <div>
                      <b>"Install app" yoki "Add to Home Screen" ni tanlang</b>
                      <p>Uzbek tilida: "Ilovani o'rnatish" yoki "Bosh ekranga qo'shish".</p>
                    </div>
                  </div>
                  <div className="ht-step">
                    <div className="ht-num">3</div>
                    <div>
                      <b>Tasdiqlang</b>
                      <p>Chaqmoq ilovasi ekraningizga qo'shiladi. Endi haqiqiy ilova kabi ishlaydi.</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="modal-foot">
                <button className="btn primary block" onClick={() => setHowto(false)}>Tushundim</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
