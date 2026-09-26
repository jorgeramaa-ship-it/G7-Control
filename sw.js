const C='g7-control-multiuser-v3';

const CORE=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install',e=>{
  self.skipWaiting();

  e.waitUntil(
    caches.open(C)
    .then(c=>c.addAll(CORE))
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    (async()=>{
      for(const k of await caches.keys()){
        if(k!==C){
          await caches.delete(k);
        }
      }

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch',e=>{

  if(e.request.method!=='GET'){
    return;
  }

  const req=e.request;

  if(req.mode==='navigate'){

    e.respondWith(
      fetch(req)
      .then(resp=>{
        const copy=resp.clone();

        caches.open(C)
        .then(c=>c.put('./index.html',copy));

        return resp;
      })
      .catch(
        ()=>caches.match('./index.html')
      )
    );

    return;
  }

  e.respondWith(
    caches.match(req)
    .then(cached=>{

      const network=
      fetch(req)
      .then(resp=>{

        const copy=resp.clone();

        caches.open(C)
        .then(c=>c.put(req,copy));

        return resp;

      })
      .catch(()=>cached);

      return cached || network;
    })
  );
});
