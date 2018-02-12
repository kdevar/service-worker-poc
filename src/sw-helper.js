import {debug, skipUrl} from './sw-helper';
import {config} from './sw-config';
import * as idb from './sw-idb';

function debug(message, options) {
    options = options || {};
    var flag = config.debug
    if (flag) {
        console.log('serviceworker: ' + message);
    }
}

function skipUrl(URL) {
    const url = URL.toLowerCase();
    const skip = url.indexOf(".js") > -1 ||
        url.indexOf(".css") > -1 ||
        url.indexOf(".htm") > -1 ||
        url.indexOf(".gif") > -1 ||
        url.indexOf(".png") > -1 ||
        url.indexOf(".jpg") > -1 ||
        url.indexOf(".less") > -1 ||
        url.indexOf(".html") > -1;
    if (skip) {
        debug(`skipping ${url}`)
    }
    return skip;
}

function displayStorage() {
    return navigator.storage.estimate().then(function (estimate) {
        debug(("storage:", estimate.usage / estimate.quota).toFixed(2));
        return estimate;
    })
}

function fetchAndCache(event) {    
    return fetch(event.request).then(function (response) {
        if (event.request.method === "GET" &&
            !skipUrl(event.request.url) &&
            response.type !== "opaque") {
            return caches.open(config.cacheName).then(function (cache) {
                queueCacheRecord(event.request);
                cache.put(event.request, response.clone());
                return response;
            });
        }
        return response;
    });
}

var cacheRecordQueue;

function queueCacheRecord(request){
    var q = recordCacheTime.bind(this, request);
    if(cacheRecordQueue){
        cacheRecordQueue = cacheRecordQueue.then(q);
    }else{
        cacheRecordQueue = q();
    }
}

function recordCacheTime(request){
    var url = request.url;
    var propertyid = request.headers.get("property-id");
    var userid = null;
    var timestamp = Date.now();
    return idb.getDb(config.cacheName).then(db => {
        return idb.setTimestampForUrl({db, url, propertyid, userid, timestamp})
    });
}

export {
    debug,
    skipUrl,
    displayStorage,
    fetchAndCache,
    queueCacheRecord
}