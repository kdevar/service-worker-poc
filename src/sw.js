import {prefetchResources} from './sw-prefetch';
import {debug, skipUrl, fetchAndCache} from './sw-helper';
import {config, getconfig} from './sw-config';
import * as idb from './sw-idb';

function doRequest(event) {    
    return caches.match(event.request).then(function (resp) {
        if (resp) {
            debug(`returning from cache ${event.request.url}`);            
            return resp;
        }
        debug(`returning from network ${event.request.url}`);
            
        return fetchAndCache(event);
    });
}

function clearAllCaches(){
    return caches.keys().then(keys => {
        return Promise.all(
            key.map(key => caches.delete(key))
        );
    });
}

self.addEventListener('message', (message) => {
    switch(message.data.type){
        case 'PREFETCH':
            debug(`prefetch request recieved`);
            return prefetchResources(message);
        case 'CACHECLEAR':
            return clearAllCaches();
        case 'CACHEREVIEW':
        return idb.getDb(config.cacheName).then(db => {
            return idb.expireEntries(db, config.maxEntries, config.timeToLiveInSeconds, Date.now(), message.data.userId).then(urlstodelete => {
                return caches.open(config.cacheName).then(cache => {
                    return Promise.all(
                        urlstodelete.map(url => cache.delete(url).then(() =>  debug(`${url} deleted`)))
                    )
                }).then(() => {
                    message.ports[0].postMessage({done:true, error:false});
                })
            })
        })        
    }    
});

self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    debug(`activating service worker .......... `);
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
    if(!skipUrl(event.request.url) && event.request.method === "GET"){           
        event.respondWith(doRequest(event));
    }
});
