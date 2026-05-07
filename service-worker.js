const CACHE_NAME = 'finanzas-cache-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/img/app-icon.svg',
  '/css/main.css?v=2024',
  '/css/dashboard.css?v=2024',
  '/css/forms.css',
  '/css/accordion.css',
  '/css/config.css',
  '/css/patrimonio.css',
  '/css/cashflow.css',
  '/css/dark-mode.css',
  '/css/grupoGastoView.custom.css',
  '/css/nav.css',
  '/css/connection.css',
  '/css/auth.css',
  '/js/env_config.js',
  '/js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
