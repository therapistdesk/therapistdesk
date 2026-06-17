const CACHE_NAME = "therapistdesk-v1";

// INSTALL
self.addEventListener("install", (event) => {
  console.log("SW installed");
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  console.log("SW activated");
  self.clients.claim();
});

// FETCH (basic cache fallback)
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((res) => {
//       return res || fetch(event.request);
//     })
//   );
// });
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // ❗ НЕ кеширай API
  if (
    url.includes("/clients") ||
    url.includes("/appointments") ||
    url.includes("/messages")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // ✅ кеширай останалото (JS, CSS, images)
  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request);
    })
  );
});



// PUSH (запазваме го)
self.addEventListener("push", function (event) {
  console.log("SW PUSH RECEIVED");

  let data = { title: "Reminder", body: "..." };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.log("PARSE ERROR", e);
  }

  self.registration.showNotification(data.title, {
    body: data.body,
  });
});