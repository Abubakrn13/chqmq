export const SOM = " so'm";

export function money(n) {
  return numFmt(n) + SOM;
}
export function money0(n) {
  return numFmt(n);
}
function numFmt(n) {
  return Math.round(n || 0)
    .toLocaleString("ru-RU")
    .replace(/\u00a0/g, " ")
    .replace(/,/g, " ");
}

export function stockState(p) {
  if (p.stock <= 0) return "out";
  if (p.stock <= p.low) return "low";
  return "ok";
}

const MONTHS = ["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"];
export const WDAYS = ["Yak", "Du", "Se", "Cho", "Pay", "Ju", "Sha"];

export function fmtDate(d) {
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}
export function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

// --- Access (time-based) helpers ---
export const TELEGRAM = "https://t.me/abubakrmirzaev";

// Is the shop's access currently active (and not expired)?
export function subActive(sub) {
  return !!(sub && sub.status === "active" && sub.activeUntil && Date.now() <= sub.activeUntil);
}

// Timestamp when access ends, or null.
export function subEndsAt(sub) {
  return sub && sub.activeUntil ? sub.activeUntil : null;
}

// Whole days remaining until access ends (0 if expired/none).
export function subDaysLeft(sub) {
  const end = subEndsAt(sub);
  if (!end) return null;
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}
