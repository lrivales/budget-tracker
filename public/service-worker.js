const APP_PREFIX = 'budget-tracker-';
const VERSION = 'v1.0';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
    './index.html',
    './js/idb.js',
    './js/index.js',
    './css/styles.css',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    )
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((resp) => {
            return resp || fetch(event.request).then((response) => {
                let responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            }).catch(err => console.log(err));
        })
    );
});

self.addEventListener('activate', (event) => {
    let cacheKeeplist = APP_PREFIX;

    event.waitUntil(
        caches.keys().then((keylist) => {
            return Promise.all(keylist.map((key) => {
                if (cacheKeeplist.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});