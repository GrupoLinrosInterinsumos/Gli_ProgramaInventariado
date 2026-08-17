// Service worker mínimo — solo existe para que Chrome/Android considere la
// app "instalable" (ícono + pantalla completa en la tablet). No cachea nada:
// esta app necesita datos en vivo, así que cada request va siempre a la red.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
