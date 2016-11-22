let CACHE_NAME = 'newspilot-writer-cache-v1';

// let urlsToCache = [
//     '/',
//     '/app.js',
//     '/index.html',
//     'serviceworker.js'
// ];
/*
 "use strict";
 console.log("WORKER: executing.");
 var version = "v1::",
 offlineFundamentals = ["", "../css/global.css", "../js/global.js"];

 self.addEventListener("install", function(e) {
 console.log("WORKER: install event in progress."), e.waitUntil(caches.open(version + "fundamentals").then(function(e) {
 return e.addAll(offlineFundamentals)
 }).then(function() {
 console.log("WORKER: install completed")
 }))
 }), self.addEventListener("fetch", function(e) {
 return console.log("WORKER: fetch event in progress."), "GET" !== e.request.method ? void console.log("WORKER: fetch event ignored.", e.request.method, e.request.url) : void e.respondWith(caches.match(e.request).then(function(n) {
 function t(n) {
 var t = n.clone();
 return console.log("WORKER: fetch response from network.", e.request.url), caches.open(version + "pages").then(function(n) {
 n.put(e.request, t)
 }).then(function() {
 console.log("WORKER: fetch response stored in cache.", e.request.url)
 }), n
 }

 function o() {
 return console.log("WORKER: fetch request failed in both cache and network."), new Response("<h1>Service Unavailable</h1>", {
 status: 503,
 statusText: "Service Unavailable",
 headers: new Headers({
 "Content-Type": "text/html"
 })
 })
 }
 var s = fetch(e.request).then(t, o)["catch"](o);
 return console.log("WORKER: fetch event", n ? "(cached)" : "(network)", e.request.url), n || s
 }))
 }),


 self.addEventListener("activate", function(e) {
 console.log("WORKER: activate event in progress."), e.waitUntil(caches.keys().then(function(e) {
 return Promise.all(e.filter(function(e) {
 return !e.startsWith(version)
 }).map(function(e) {
 return caches["delete"](e)
 }))
 }).then(function() {
 console.log("WORKER: activate completed.")
 }))
 });*/

self.addEventListener('install', (event) => {
    console.log("Install");
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/app.js',
                    '/assets/icon.svg',
                    '/substance/substance.css',
                    '/substance/substance-reset.css',
                    '/substance/substance-pagestyle.css',
                    '/substance/substance.js',
                    '/font-awesome/css/font-awesome.min.css',
                    '/styles/app.css',
                    '/api/config',
                    '/writer/assets/icon.svg'
                ])
            })
            .then(() => {
                self.skipWaiting()
            })
            .catch((e) => {
                console.log("Error", e);
            })
    )
})

const urlsNotToCache = [
    '/search/concepts/',
    // 'imType=x-im/article',
    'sockjs-node',
    'chrome-extension',
    'spellcheck',
    'gstatic.com',
    'googleapis'
]

function shouldResponseBeCached(response) {
    return !(!response || response.status !== 200 && response.status !== 0 || response.type !== 'basic' && response.type !== 'opaque');
}

self.addEventListener('fetch', function (event) {

    const method = event.request.method
    const url = event.request.url

    let foundURL = urlsNotToCache.find((notCachebleURL) => {
        return url.indexOf(notCachebleURL) >= 0
    })

    // If we found a url that we are not supposed to cache
    // or the the request method is other then GET
    // We just return the response
    if (method !== 'GET' || foundURL) {
        // console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return
    }

    event.respondWith(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.match(event.request)
                    .then((response) => {

                        if (response && !navigator.onLine) {
                            // console.log("Response is cached return and user offline");
                            return response
                        }

                        var fetchRequest = event.request.clone();

                        return fetch(fetchRequest)
                            .then((response) => {
                                if(shouldResponseBeCached(response)) {
                                    // console.log(`Cache new response for ${url}`);
                                    cache.put(event.request, response.clone())
                                    return response;
                                } else {
                                    return response
                                }

                            })
                    })
            })
    )
})