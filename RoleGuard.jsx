/* InstallPrompt — floating banner that offers to install the PWA.
   Shown once the browser fires `beforeinstallprompt`. Dismissible;
   choice is remembered in localStorage so we don't badger the user. */
import { useEffect, useState } from "react";

const KEY = "chaqmoq.install.dismissedAt";
const DISMISS_DAYS = 14;

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If the app is already installed (opened from home screen), never show.
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;
    // Respect a recent dismissal.
    const last = Number(localStorage.getItem(KEY) || 0);
    if (last && Date.now() - last < DISMISS_DAYS * 86400000) return;

    function onPrompt(e) {
      // Browser is ready to install — hold on to the event and show our UI.
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    // If the app gets installed while we're running, hide immediately.
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch {}
    setDeferred(null);
    setVisible(false);
  }
  function dismiss() {
    localStorage.setItem(KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div className="install-prompt">
      <div className="ip-body">
        <div className="ip-ic">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#FFE7A6" stroke="#FFE7A6" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <b>Chaqmoqni ilova sifatida o'rnating</b>
          <p>Bosh ekrandan bir bosishda oching, offline'da ham ishlaydi.</p>
        </div>
      </div>
      <div className="ip-actions">
        <button className="btn ghost sm" onClick={dismiss}>Keyinroq</button>
        <button className="btn primary sm" onClick={install}>O'rnatish</button>
      </div>
    </div>
  );
}
