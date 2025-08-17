const CACHE = 'slumbr-v1';
const ASSETS = [
  './','./index.html','./manifest.webmanifest',
  './background.png','./astral_knob.png','./lucid_knob.png','./master_knob.png',
  './sky_knob.png','./fire_knob.png','./earth_knob.png','./sea_knob.png',
  // sounds
  // Add every file you ship below, for example:
  // './sounds/sky1.ogg','./sounds/sky2.ogg', ... and so on for fire/earth/sea
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      // opportunistic cache
      const copy = resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return resp;
    }).catch(()=>r))
  );
});
