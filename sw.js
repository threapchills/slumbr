const CACHE_NAME = 'slumbr-v4';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './background.png',
  './astral_knob.png',
  './lucid_knob.png',
  './master_knob.png',
  './sky_knob.png',
  './fire_knob.png',
  './earth_knob.png',
  './sea_knob.png',
  './random.png',
  './save.png',
  './load.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('slumbr-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if(request.method !== 'GET'){ return; }

  const url = new URL(request.url);

  if(request.mode === 'navigate'){
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' }))
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(resp => resp || caches.match('./index.html')))
    );
    return;
  }

  if(url.origin === location.origin){
    if(url.pathname === '/' || url.pathname.endsWith('/index.html')){
      event.respondWith(
        fetch(new Request(request, { cache: 'no-store' }))
          .then(networkResp => {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            return networkResp;
          })
          .catch(()=> caches.match(request))
      );
      return;
    }

    if(url.pathname.startsWith('/sounds/')){
      event.respondWith(
        caches.match(request).then(resp => resp || fetch(request))
      );
      return;
    }

    event.respondWith(
      caches.match(request).then(cacheResp => {
        if(cacheResp){ return cacheResp; }
        return fetch(request).then(networkResp => {
          if(networkResp && networkResp.status === 200){
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return networkResp;
        });
      })
    );
  }
});
