self.addEventListener('push', function (event) {
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