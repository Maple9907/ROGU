const C='ashbound-v8';
const PRECACHE=['./','./index.html','./manifest.webmanifest','./icons/192.png','./icons/512.png','./icons/maskable-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(PRECACHE)).catch(()=>{}).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
// PWA-01: cache-first cho GET cùng origin, navigation fallback về index.html; không reload giữa run (client tự toast)
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET'||!r.url.startsWith(self.location.origin))return;
if(r.mode=='navigate'){e.respondWith(caches.match('./index.html',{ignoreSearch:true}).then(m=>fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(k=>k.put('./index.html',c))}return res}).catch(()=>m||caches.match('./'))));return}
e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(k=>k.put(r,c))}return res}).catch(()=>caches.match('./index.html',{ignoreSearch:true}))))});
