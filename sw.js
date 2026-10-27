/* Central do Gerente - service worker (stale-while-revalidate) */
const CACHE='central-eb-v3';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',function(e){ e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS).catch(function(){});}).then(function(){return self.skipWaiting();})); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); }));}).then(function(){return self.clients.claim();})); });
self.addEventListener('fetch',function(e){
  var req=e.request; var url;
  try{ url=new URL(req.url); }catch(_){ return; }
  if(req.method!=='GET' || url.origin!==self.location.origin){ return; } /* supabase e externos vao direto pra rede */
  /* stale-while-revalidate: entrega do cache na hora e atualiza em segundo plano */
  e.respondWith(
    caches.match(req).then(function(hit){
      var net=fetch(req).then(function(res){
        try{ var cp=res.clone(); caches.open(CACHE).then(function(c){c.put(req,cp);}); }catch(_){}
        return res;
      }).catch(function(){ return hit || caches.match('./index.html'); });
      return hit || net;
    })
  );
});
