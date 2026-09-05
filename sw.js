// SapanaCyberHub × Listen — Service Worker v1.0
const CACHE_NAME = "sch-listen-v1";
const STATIC_ASSETS = [
  "/online-earning/listen-enjoy-earn/",
  "/assets/logo.png",
  "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500&display=swap",
];

// ── Install: cache static assets ──────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silently fail on individual asset cache errors
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first, fallback to cache ───────────────────────────────
self.addEventListener("fetch", (e) => {
  // Only handle GET requests
  if (e.request.method !== "GET") return;

  // Skip Firebase & API calls — always go to network
  const url = e.request.url;
  if (
    url.includes("firebaseapp.com") ||
    url.includes("googleapis.com/identitytoolkit") ||
    url.includes("cloudfunctions.net") ||
    url.includes("firestore.googleapis.com")
  ) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful page/asset responses
        if (res.ok && (e.request.destination === "document" || e.request.destination === "image")) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Offline fallback: serve from cache
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          // Offline fallback page for navigation requests
          if (e.request.destination === "document") {
            return caches.match("/online-earning/listen-enjoy-earn/");
          }
        });
      })
  );
});

// ── Push notifications (future use) ──────────────────────────────────────
self.addEventListener("push", (e) => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || "SapanaCyberHub × Listen", {
      body:    data.body || "New event is live! Earn rewards now 🎧",
      icon:    "/assets/SapanaCyberHub-Logo.webp",
      badge:   "/assets/SapanaCyberHub-Logo.webp",
      tag:     "sch-listen-notification",
      vibrate: [200, 100, 200],
      data:    { url: data.url || "/online-earning/listen-enjoy-earn/" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || "/online-earning/listen-enjoy-earn/"));
});


self.options = {
    "domain": "5gvci.com",
    "zoneId": 10745990
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')