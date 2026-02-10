// Service Worker para Bus Casa PWA
const CACHE_NAME = 'bus-casa-v24';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './main.js',
    './stops-data.json',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Instalación - Cachear assets
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación - Limpiar caches antiguas
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando cache antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Estrategia Network First para assets propios, Cache First para CDN
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Network First para archivos propios (HTML, JS, CSS) - siempre intenta actualizar
    const isOwnAsset = url.origin === self.location.origin &&
                       (url.pathname.endsWith('.html') ||
                        url.pathname.endsWith('.js') ||
                        url.pathname.endsWith('.css') ||
                        url.pathname === '/' || url.pathname === './');

    if (isOwnAsset) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cachear la nueva versión
                    if (request.method === 'GET' && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Si falla la red, usar cache como fallback
                    return caches.match(request);
                })
        );
    } else {
        // Cache First para CDN/fonts y otros assets (imágenes, JSON)
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(request).then(response => {
                        // Cachear nuevos recursos
                        if (request.method === 'GET' && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    });
                })
        );
    }
});
