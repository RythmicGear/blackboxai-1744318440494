const CACHE_NAME = 'rythmic-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'css/styles.css',
    'js/main.js',
    'js/rss.js',
    'js/auth.js',
    'manifest.json',
    'assets/images/icon-base.svg',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                console.error('Error caching assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request because it's a one-time use stream
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    (response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response because it's a one-time use stream
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Don't cache RSS feed responses
                                if (!event.request.url.includes('rss2json.com')) {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return response;
                    }
                );
            })
            .catch(() => {
                // If both cache and network fail, show offline page
                if (event.request.mode === 'navigate') {
                    return caches.match('offline.html');
                }
            })
    );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-news') {
        event.waitUntil(
            // Implement background sync logic here
            syncNews()
        );
    }
});

// Push notification handling
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: 'assets/images/icon-base.svg',
        badge: 'assets/images/icon-base.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Read More',
                icon: 'assets/images/icon-base.svg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: 'assets/images/icon-base.svg'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('RYTHMIC News Update', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// Helper function for background sync
async function syncNews() {
    try {
        const newsCache = await caches.open('news-cache');
        const cachedRequests = await newsCache.keys();
        
        for (const request of cachedRequests) {
            try {
                const response = await fetch(request);
                await newsCache.put(request, response);
            } catch (error) {
                console.error('Error syncing news:', error);
            }
        }
    } catch (error) {
        console.error('Error in background sync:', error);
    }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-news') {
        event.waitUntil(syncNews());
    }
});
