const CACHE_NAME = 'pwa-notes-cache-v3';

const PRECACHE_URLS = [
    '/pages/index.html',
    '/manifest.json',
    '/pages/profile.html'
];

// installs pre-cache app shell
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
    );
});

// clean up old cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(oldKey => caches.delete(oldKey))
            )
        )
    );
    self.clients.claim();
});

// fetch handler
self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    if (request.destination === 'script') {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return networkResponse;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Handle navigation requests (HTML)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(resp => {
                    const copy = resp.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put('/pages/index.html', copy));
                    return resp;
                })
                .catch(() => caches.match('/pages/index.html'))
        );
        return;
    }

    // Default: cache-first for other assets
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;

            return fetch(request)
                .then(networkResponse => {
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        request.destination !== 'document'
                    ) {
                        const respClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, respClone));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Offline'
                    });
                });
        })
    );
});