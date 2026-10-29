/* Service Worker - Central do Gerente (Ensina Banco)
   Estratégia: NETWORK-FIRST.
   Sempre tenta baixar a versão mais nova do site; só usa o cache quando está offline.
   Assim, toda vez que você subir uma versão nova no GitHub, ela aparece na hora.
   Troque o número da versão abaixo a cada atualização grande (opcional). */
const CACHE = 'central-ensina-v298';

self.addEventListener('install', function(e){
  // ativa o SW novo imediatamente, sem esperar fechar as abas
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      // apaga caches antigos de versões anteriores
      return Promise.all(keys.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET'){ return; }
  e.respondWith(
    fetch(req).then(function(res){
      // guarda uma cópia pra funcionar offline depois
      try{
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
      }catch(_){}
      return res;
    }).catch(function(){
      // sem internet: usa o que tiver no cache
      return caches.match(req).then(function(m){ return m || caches.match('index.html'); });
    })
  );
});
