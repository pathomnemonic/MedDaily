const CACHE = "meddaily-shell-v3";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./meddaily-icon.svg", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const shellUrl = new URL("./index.html", self.registration.scope).toString();
const rootUrl = new URL("./", self.registration.scope).toString();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then(async (cache) => {
        await cache.addAll(CORE.map((path) => new URL(path, self.registration.scope).toString()));
        // Precache the built JS/CSS the shell references so the very first offline visit works.
        try {
          const html = await (await fetch(shellUrl, { cache: "reload" })).text();
          const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => new URL(m[1], self.registration.scope).toString());
          await Promise.all(assets.map((asset) => cache.add(asset).catch(() => undefined)));
          // Fonts and images referenced from the built CSS.
          for (const asset of assets.filter((a) => a.endsWith(".css"))) {
            const css = await (await fetch(asset)).text();
            const refs = [...css.matchAll(/url\(\s*["']?([^)"']+\.(?:woff2|woff|png|svg|jpg|webp))["']?\s*\)/g)].map((m) => new URL(m[1], asset).toString());
            await Promise.all(refs.map((ref) => cache.add(ref).catch(() => undefined)));
          }
        } catch { /* offline during install: runtime caching still fills in */ }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("meddaily-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(shellUrl, copy));
        }
        return response;
      }).catch(async () => (await caches.match(shellUrl, { ignoreVary: true })) || (await caches.match(rootUrl, { ignoreVary: true }))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});