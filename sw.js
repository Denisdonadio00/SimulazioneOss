const CACHE_NAME = 'oss-study-v1.3'; 
const assets = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', event => {
    console.log('SW: Installazione in corso...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Proviamo a caricarli uno per uno per non far fallire tutto
            return Promise.all(
                assets.map(url => {
                    return cache.add(url).catch(err => {
                        console.error(`SW: Errore 404 sul file: ${url}`, err);
                    });
                })
            );
        })
    );
    // Forza il nuovo Service Worker a diventare attivo immediatamente
    self.skipWaiting();
});

// Pulizia delle vecchie cache all'attivazione
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Eliminazione vecchia cache...', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        }).catch(() => {
            // Opzionale: ritorna una pagina di errore se entrambi falliscono
        })
    );
});
