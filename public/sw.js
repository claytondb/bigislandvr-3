// Big Island VR - Service Worker
// Provides offline shell caching and performance optimization

const CACHE_NAME = 'bigisland-vr-v1';
const STATIC_CACHE = 'bigisland-static-v1';
const DYNAMIC_CACHE = 'bigisland-dynamic-v1';

// Core files to cache for offline shell
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Google APIs to cache dynamically
const GOOGLE_APIS = [
    'maps.googleapis.com',
    'maps.gstatic.com'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Cache failed:', err);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => {
                            return name.startsWith('bigisland-') && 
                                   name !== STATIC_CACHE && 
                                   name !== DYNAMIC_CACHE;
                        })
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Handle Google APIs - network first, cache fallback
    if (GOOGLE_APIS.some(api => url.hostname.includes(api))) {
        event.respondWith(networkFirst(event.request, DYNAMIC_CACHE));
        return;
    }
    
    // Handle static assets - cache first
    if (event.request.destination === 'document' || 
        event.request.destination === 'script' ||
        event.request.destination === 'style') {
        event.respondWith(cacheFirst(event.request, STATIC_CACHE));
        return;
    }
    
    // Handle images - stale while revalidate
    if (event.request.destination === 'image') {
        event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE));
        return;
    }
    
    // Default - network first
    event.respondWith(networkFirst(event.request, DYNAMIC_CACHE));
});

// Cache strategies

// Cache first - best for static assets
async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return offline page if available
        return caches.match('/index.html');
    }
}

// Network first - best for dynamic content
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback
        return new Response('Offline', { 
            status: 503, 
            statusText: 'Service Unavailable' 
        });
    }
}

// Stale while revalidate - best for images
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then(names => {
                return Promise.all(
                    names.map(name => caches.delete(name))
                );
            })
        );
    }
});

// Background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

async function syncFavorites() {
    // Could sync user favorites when back online
    console.log('[SW] Syncing favorites...');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    
    const options = {
        body: data.body || 'New update from Big Island VR',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Big Island VR', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
