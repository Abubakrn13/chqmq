/* Thin API client. Same-origin in production; Vite proxies /api in dev. */
const TOKEN_KEY = "chaqmoq.token";
const BRANCH_KEY = "chaqmoq.branch";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

// Return the current path with ?branchId= appended if set and if the path
// doesn't already include it. Only affects GETs — mutations rely on the
// token's branchId (for locked users) or explicit body params.
function withBranch(method, path) {
  if (method !== "GET") return path;
  const bId = localStorage.getItem(BRANCH_KEY);
  if (!bId) return path;
  if (path.includes("branchId=")) return path;
  return path + (path.includes("?") ? "&" : "?") + "branchId=" + encodeURIComponent(bId);
}

async function req(method, path, body) {
  const res = await fetch("/api" + withBranch(method, path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: "Bearer " + getToken() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    /* empty body */
  }
  if (res.status === 402) {
    // Subscription became inactive mid-session — tell the app to re-check.
    if (typeof window !== "undefined")
      window.dispatchEvent(new CustomEvent("chaqmoq:sub-inactive"));
  }
  if (!res.ok) {
    const err = new Error(data.error || "Server bilan bog'lanishda xatolik");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (p) => req("GET", p),
  post: (p, b) => req("POST", p, b),
  put: (p, b) => req("PUT", p, b),
  del: (p) => req("DELETE", p),
};
