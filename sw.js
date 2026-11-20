/* Church Asset Manager: keeps the app on this device so it opens without internet.
   The app's own files: network first (so updates arrive), saved copy when offline.
   Libraries and fonts: saved copy first. Item photos: saved after first view.
   Database requests are never cached here; the app keeps its own saved copy of the data. */
const VERSION = "cam-v5";
const APP_FILES = ["./", "./index.html", "./config.js", "./logo.png", "./apple-touch-icon.png",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./manifest.webmanifest"];
const LIBS = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"
];
const LIB_HOSTS = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(APP_FILES);
    await Promise.all(LIBS.map((url) => fetch(url, { mode: "no-cors" }).then((res) => cache.put(url, res)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== VERSION) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        return (await cache.match(req, { ignoreSearch: true }))
          || (req.mode === "navigate" ? await cache.match("./index.html") : undefined)
          || Response.error();
      }
    })());
    return;
  }

  if (url.hostname.endsWith(".supabase.co") && url.pathname.includes("/storage/v1/object/sign/")) {
    const key = url.origin + url.pathname;   // signed links change; the photo doesn't
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(key);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) cache.put(key, res.clone());
      return res;
    })());
    return;
  }

  if (LIB_HOSTS.includes(url.hostname)) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    })());
  }
});
