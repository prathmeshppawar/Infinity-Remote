const staticCache = "static-v2";
const assets = [
  "/",
  "/css/welcome.css",
  "/scripts/welcome.js",
  "/views/offline.html",
  "/icons/error.png",
  "/css/errors.css",
];
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(staticCache).then(function (cache) {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== staticCache).map((key) => caches.delete())
      );
    })
  );
});
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return (
        response ||
        fetch(event.request).catch(() => caches.match("/views/offline.html"))
      );
    })
  );
});
