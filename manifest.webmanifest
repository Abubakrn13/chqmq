/* Chaqmoq service worker — app-shell caching.
   
   Strategy:
   - App shell (HTML, CSS, JS, icons): cache-first with background refresh.
     Lets the panel open instantly and even when the tab is offline.
   - API requests (/api/*): network-only. Business data must always be
     fresh — we never want to serve stale sales or stock. If the network
     is down the request fails and the UI shows an offline notice.
   
   Bump SW_VERSION whenever cached shell files change so old clients
   drop the stale cache and re-fetch.
*/
const SW_VERSION = "chaqmoq-v2";
const SHELL_CACHE = `${SW_VERSION}-shell`;
const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  // Precache the shell so the app opens instantly next time.
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Drop old caches so we don't hoard versions after upgrades.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(SW_VERSION)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only handle GETs — never intercept POST/PUT/DELETE. Business
  // mutations must go to the network, period.
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Don't cache the API. Business data must be current.
  if (url.pathname.startsWith("/api/")) return;
  // Don't cache the SSE stream.
  if (url.pathname.startsWith("/api/live/stream")) return;
  // Only cache same-origin resources.
  if (url.origin !== self.location.origin) return;

  // Stale-while-revalidate for the app shell — instant response from cache,
  // background refetch to keep things fresh.
  event.respondWith(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
