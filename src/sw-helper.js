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
        url.indexOf(".gstatic") > -1 ||
        url.indexOf(".googleapis") > -1 ||
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
    let headers = new Headers(event.request.headers);
    headers.delete("property-id");
    headers.delete("user-id");
    let request = new Request(event.request.url, { 
        credentials: 'include', 
        headers,
        method: event.request.method
    });     
    return fetch(request).then(function (response) {
        if (request.method === "GET" &&
            !skipUrl(request.url) &&
            response.type !== "opaque") {
            return caches.open(config.cacheName).then(function (cache) {
                queueDbWrite(event.request);
                cache.put(request, response.clone());
                return response;
            });
        }
        return response;
    });
}

var dbWriteQueue;

function queueDbWrite(request){
    var q = dbWrite.bind(this, request);
    if(dbWriteQueue){
        dbWriteQueue = dbWriteQueue.then(q);
    }else{
        dbWriteQueue = q();
    }
}

function dbWrite(request){
    var url = request.url;
    var propertyid = request.headers.get("property-id");
    var userid = request.headers.get("user-id");
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
    queueDbWrite
}
