// CHUTES AI Chat Service Worker
const CACHE_NAME = 'chutes-ai-chat-v2.0';
const STATIC_CACHE = 'chutes-static-v2.0';
const DYNAMIC_CACHE = 'chutes-dynamic-v2.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/robots.txt'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/v1\/chat\/completions/,
  /\/api\/models/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Network failed, trying cache for API request');
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({
        error: 'Offline - API request failed',
        message: 'You are currently offline. Please check your internet connection.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests with cache-first strategy
async function handleNavigationRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache the response
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Network failed, serving offline page');
    
    // Serve offline page
    const offlineResponse = await caches.match('/index.html');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Failed to fetch static resource', request.url);
    
    // Return a fallback response for images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#6b7280">Image unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    return new Response('Resource unavailable', { status: 503 });
  }
}

// Background sync for offline messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-messages') {
    console.log('🔄 Service Worker: Background sync triggered');
    event.waitUntil(syncOfflineMessages());
  }
});

// Sync offline messages when connection is restored
async function syncOfflineMessages() {
  try {
    // Get offline messages from IndexedDB or localStorage
    const offlineMessages = await getOfflineMessages();
    
    for (const message of offlineMessages) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
        
        if (response.ok) {
          await removeOfflineMessage(message.id);
          console.log('✅ Service Worker: Synced offline message', message.id);
        }
      } catch (error) {
        console.error('❌ Service Worker: Failed to sync message', error);
      }
    }
  } catch (error) {
    console.error('❌ Service Worker: Background sync failed', error);
  }
}

// Helper functions for offline message management
async function getOfflineMessages() {
  // This would integrate with IndexedDB or localStorage
  // For now, return empty array
  return [];
}

async function removeOfflineMessage(messageId) {
  // This would remove the message from IndexedDB or localStorage
  // Implementation depends on storage strategy
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New message received',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Chat',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CHUTES AI Chat', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🎯 CHUTES AI Chat Service Worker loaded');