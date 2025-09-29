const CACHE_NAME = 'slumbr-v3';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './backgroundlatest.png',
  './astral_knob.png',
  './lucid_knob.png',
  './master_knob.png',
  './sky_knob.png',
  './fire_knob.png',
  './earth_knob.png',
  './sea_knob.png',
  './random.png',
  './load.png',
  './save.png'
];

self.addEventListener('install', event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=> cache.addAll(PRECACHE_URLS)).catch(()=>{})
  );
});

self.addEventListener('activate', event=>{
  event.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(key=> key !== CACHE_NAME).map(key=> caches.delete(key))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', event=>{
  const { request } = event;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== location.origin) return;
  if(url.pathname.startsWith('/sounds/')) return;

  if(request.destination === 'document'){
    event.respondWith(
      fetch(request).then(response=>{
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache=> cache.put(request, copy));
        return response;
      }).catch(()=> caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>{
      if(cached) return cached;
      return fetch(request).then(response=>{
        if(response && response.ok){
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache=> cache.put(request, copy));
        }
        return response;
      }).catch(()=> caches.match(request));
    })
  );
});
