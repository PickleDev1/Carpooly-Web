const CACHE_NAME = 'carpooly-cache-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/dashboard',
  '/carpools/list',
  '/carpools/create',
  '/assets/logo/carpooly-logo.jpg',
  '/assets/images/carpool-illustration.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            return null;
          });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
}); 