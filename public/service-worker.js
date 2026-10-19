// Retire the legacy service worker. The Vite PWA plugin now owns service-worker
// registration and updates through /sw.js.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.delete('tapesure-v1'),
      self.registration.unregister(),
    ]).then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => Promise.all(
        clients.map((client) => client.navigate(client.url))
      ))
  );
});
