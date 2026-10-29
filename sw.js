/* Offline support: the app shell is cached on install; model files are cached the first time they're used. */
const SHELL = "closet-shell-1.9.0";
const MODELS = "closet-models-v1";
const FILES = [
 "./",
 "index.html",
 "worker.js?v=1.9.0",
 "manifest.webmanifest",
 "icons/icon.svg",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/maskable-512.png",
 "icons/apple-touch-icon.png",
 "ort/ort.wasm.min.js",
 "ort/ort-wasm-simd.wasm",
 "ort/ort-wasm.wasm",
 "fonts/bricolage-grotesque-latin-500-normal.woff2",
 "fonts/bricolage-grotesque-latin-700-normal.woff2",
 "fonts/bricolage-grotesque-latin-800-normal.woff2",
 "fonts/figtree-latin-400-normal.woff2",
 "fonts/figtree-latin-500-normal.woff2",
 "fonts/figtree-latin-600-normal.woff2",
 "fonts/ibm-plex-mono-latin-400-normal.woff2",
 "fonts/ibm-plex-mono-latin-500-normal.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== MODELS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const isModel = req.url.includes("/model/");
  const isFont = req.url.includes("/fonts/");
  e.respondWith((async () => {
    const hit = await caches.match(req, {ignoreSearch: req.mode === "navigate"});
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok && (isModel || isFont || req.mode === "navigate")) {
        const c = await caches.open(isModel ? MODELS : SHELL); c.put(req, res.clone());
      }
      return res;
    } catch (err) {
      if (req.mode === "navigate") { const page = await caches.match("index.html"); if (page) return page; }
      throw err;
    }
  })());
});
