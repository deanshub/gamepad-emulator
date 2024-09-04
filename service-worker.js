const CACHE_NAME = 'nes-emulator-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/src/main.ts',
    '/manifest.json',
    'https://unpkg.com/jsnes/dist/jsnes.min.js'
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
            .then((response) => response || fetch(event.request))
    );
});