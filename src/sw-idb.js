/*
 Copyright 2015 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 
 modified by me (Kiran Devarakonda) slightly
*/

import {debug} from './sw-helper';

var DB_PREFIX = '';
var DB_VERSION = 1;
var STORE_NAME = 'store';
var URL_PROPERTY = 'url';
var TIMESTAMP_PROPERTY = 'timestamp';
var PROPERTY_ID_PROPERTY = 'propertyid';
var USER_ID_PROPERTY = 'userid';
var cacheNameToDbPromise = {};

function openDb(cacheName) {
  return new Promise(function(resolve, reject) {
    var request = indexedDB.open(DB_PREFIX + cacheName, DB_VERSION);

    request.onupgradeneeded = function() {
      var objectStore = request.result.createObjectStore(STORE_NAME,{keyPath: URL_PROPERTY});
      objectStore.createIndex(TIMESTAMP_PROPERTY, TIMESTAMP_PROPERTY,{unique: false});
      objectStore.createIndex(PROPERTY_ID_PROPERTY, PROPERTY_ID_PROPERTY,{unique: false});
      objectStore.createIndex(USER_ID_PROPERTY, USER_ID_PROPERTY,{unique: false});
    };

    request.onsuccess = function() {
      resolve(request.result);
    };

    request.onerror = function() {
      reject(request.error);
    };
  });
}

function getDb(cacheName) {
  if (!(cacheName in cacheNameToDbPromise)) {
    cacheNameToDbPromise[cacheName] = openDb(cacheName);
  }

  return cacheNameToDbPromise[cacheName];
}

function setTimestampForUrl({db, url, propertyid, userid, timestamp}) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction(STORE_NAME, 'readwrite');
      var objectStore = transaction.objectStore(STORE_NAME);
      objectStore.put({url, propertyid, userid, timestamp});
  
      transaction.oncomplete = function() {
        resolve(db);
      };
  
      transaction.onabort = function() {
        reject(transaction.error);
      };
    });
  }


  
function expireOldEntries({db, maxAgeSeconds, now, userId}) {
    if (!maxAgeSeconds) {
      return Promise.resolve([]);
    }
  
    return new Promise(function(resolve, reject) {
      var maxAgeMillis = maxAgeSeconds * 1000;
      var urls = [];
      
  
      var transaction = db.transaction(STORE_NAME, 'readwrite');
      var objectStore = transaction.objectStore(STORE_NAME);
      var index = objectStore.index(TIMESTAMP_PROPERTY);
  
      index.openCursor().onsuccess = function(cursorEvent) {
        var cursor = cursorEvent.target.result;
        if (cursor) {
          if(cursor.value[USER_ID_PROPERTY] && cursor.value[USER_ID_PROPERTY] !== userId){
            objectStore.clear();
            debug("object store cleared for user switch");
            cursor.continue();
          }
          if (now - maxAgeMillis > cursor.value[TIMESTAMP_PROPERTY]) {
            var url = cursor.value[URL_PROPERTY];
            urls.push(url);
            objectStore.delete(url);
            cursor.continue();
          }
        }
      };
  
      transaction.oncomplete = function() {
        resolve(urls);
      };
  
      transaction.onabort = reject;
    });
  }

  function expireExtraEntries(db, maxEntries) {
    if (!maxEntries) {
      return Promise.resolve([]);
    }
  
    return new Promise(function(resolve, reject) {
      var urls = [];
  
      var transaction = db.transaction(STORE_NAME, 'readwrite');
      var objectStore = transaction.objectStore(STORE_NAME);
      var index = objectStore.index(TIMESTAMP_PROPERTY);
  
      var countRequest = index.count();
      index.count().onsuccess = function() {
        var initialCount = countRequest.result;
  
        if (initialCount > maxEntries) {
          index.openCursor().onsuccess = function(cursorEvent) {
            var cursor = cursorEvent.target.result;
            if (cursor) {
              var url = cursor.value[URL_PROPERTY];
              urls.push(url);
              objectStore.delete(url);
              if (initialCount - urls.length > maxEntries) {
                cursor.continue();
              }
            }
          };
        }
      };
  
      transaction.oncomplete = function() {
        resolve(urls);
      };
  
      transaction.onabort = reject;
    });
  }
  
  function expireEntries(db, maxEntries, maxAgeSeconds, now, userId) {
    return expireOldEntries({db, maxAgeSeconds, now, userId}).then(function(oldUrls) {
      return expireExtraEntries(db, maxEntries).then(function(extraUrls) {
        return oldUrls.concat(extraUrls);
      });
    });
  }

 

  
export {
    getDb,
    setTimestampForUrl,
    expireEntries
  };
