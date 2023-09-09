const CACHE_NAME = 'the-phonecall-v1';
const ASSETS = [
    "/",
    "/index.html",
    "/game.html",
    "/credits.html",
    "/settings.html",
    "/game-style.css",
    "/menu-style.css",
    "/script.js",
    "/text.js",
    "/documents.js",
    "/drawer_contents.js",
    "/imgs/logo192.png",
    "/imgs/logo512.png",
    "/imgs/logo1024.png"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});


self.addEventListener("activate", event => {
    event.waitUntil(
        self.clients.claim()
    );
    setTimeout(() => {
        self.registration.showNotification("1 Missed Call", {
            body: "From: Minister of Defense"
        });
    }, 2*24*60*60*1000); // 2 days in ms

    // I have no idea if this will do what I want, but I may try I guess...

});