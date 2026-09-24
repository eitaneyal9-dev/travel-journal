// ---------------------------------------------
// יומן המסע - Service Worker
// מאפשר לאפליקציה לפעול ללא אינטרנט
// ---------------------------------------------

// שם המטמון וגרסתו
const CACHE_NAME = "travel-journal-v3";
// קובצי האפליקציה שנרצה לשמור במכשיר
const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg",
    "./icon-192.png",
    "./icon-512.png"
];


// ---------------------------------------------
// שלב 1: שמירת קובצי האפליקציה
// ---------------------------------------------

self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME).then(function(cache) {

            return cache.addAll(APP_FILES);

        })

    );

});


// ---------------------------------------------
// שלב 2: מחיקת גרסאות ישנות של המטמון
// ---------------------------------------------

self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys().then(function(cacheNames) {

            return Promise.all(

                cacheNames.map(function(cacheName) {

                    if (
                        cacheName.startsWith("travel-journal-") &&
                        cacheName !== CACHE_NAME
                    ) {

                        return caches.delete(cacheName);

                    }

                })

            );

        }).then(function() {

            return self.clients.claim();

        })

    );

});


// ---------------------------------------------
// שלב 3: טעינת האפליקציה גם ללא אינטרנט
// ---------------------------------------------

self.addEventListener("fetch", function(event) {

    // נטפל רק בבקשות מסוג GET

    if (event.request.method !== "GET") {

        return;

    }

    // נטפל רק בבקשות ששייכות לאתר שלנו

    const requestURL = new URL(event.request.url);

    if (requestURL.origin !== self.location.origin) {

        return;

    }

    event.respondWith(

        caches.match(event.request).then(function(cachedResponse) {

            // אם הקובץ כבר שמור במכשיר,
            // נשתמש בעותק המקומי שלו

            if (cachedResponse) {

                return cachedResponse;

            }

            // אם הקובץ אינו שמור,
            // ננסה לטעון אותו דרך האינטרנט

            return fetch(event.request);

        }).catch(function() {

            // אם אין אינטרנט והמשתמש מנסה
            // לפתוח עמוד, נציג את האפליקציה השמורה

            if (event.request.mode === "navigate") {

                return caches.match("./index.html");

            }

            return Response.error();

        })

    );

});