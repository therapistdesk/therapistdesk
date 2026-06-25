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

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ❗ всички API заявки
  // if (url.pathname.startsWith("/auth") ||
  //     url.pathname.startsWith("/clients") ||
  //     url.pathname.startsWith("/appointments") ||
  //     url.pathname.startsWith("/messages")) {
  //   event.respondWith(fetch(event.request));
  //   return;
  // }
  if (url.pathname.startsWith("/")) {
    // 👉 всички API заявки → директно към network
    event.respondWith(fetch(event.request));
    return;
  }

  // ✅ само static assets
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