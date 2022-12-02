const CACHE_NAME = "its-just-a-lil-world";
const urlsToCache = [
  "/",
  "/public/index.html",
  "/src/index.js",
  "/src/App.js",
  "/src/Countries.js",
  "/src/country_data.json",
];

// self.addEventListener(‘install’, function(event) {
// // Perform install steps
// event.waitUntil(
// caches.open(CACHE_NAME)
// .then(function(cache) {
// console.log(‘Opened cache’);
// return cache.addAll(urlsToCache);
// })
// );
// });

// handle the install event
// eslint-disable-next-line
self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(urlsToCache);
      console.log("added to cache!");
    })
  );
});

// add fetch event listener
// eslint-disable-next-line
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        console.log("loading from cache!");
        return response;
      }
      console.log("not loading from cache..");
      return fetch(event.request);
    })
  );
});
