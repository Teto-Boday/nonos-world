// Offline support: keeps the app shell on the device. VERSION is replaced at build time.
const VERSION = "dev";
const CACHE = "nw-" + VERSION;
const SHELL = ["./", "index.html", "main.js", "style.css", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png", "icon-180.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("nw-") && k !== CACHE && k !== "nw-fonts").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
let slowUntil = 0;
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // network first (fresh updates). If the network fails or is slow (over 2.5s), open from the cache; the fresh copy is still saved in the background for next time
    const fromCache = () => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === "navigate" ? caches.match("index.html") : undefined));
    const net = fetch(req.mode === "navigate" ? req.url : req, { cache: "no-cache" }).then(r => r.ok ? caches.open(CACHE).then(c => c.put(req, r.clone())).then(() => r) : r);
    e.waitUntil(net.catch(() => {}));
    e.respondWith(new Promise(done => {
      let settled = false; const finish = r => { if (!settled && r){ settled = true; done(r); } };
      const timer = setTimeout(() => { slowUntil = Date.now() + 30000; fromCache().then(finish); }, Date.now() < slowUntil ? 0 : 2500); // once one file timed out, the rest of this launch come straight from the cache
      net.then(r => { clearTimeout(timer); finish(r); }, () => { clearTimeout(timer); fromCache().then(r => finish(r || Response.error())); });
    }));
  } else if (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com") {
    e.respondWith(caches.open("nw-fonts").then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
  }
});
