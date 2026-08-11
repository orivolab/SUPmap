self.addEventListener("push", (event) => {
  let data = {
    title: "SUPmap",
    body: "Masz nowe powiadomienie.",
    url: "/",
  };

  if (event.data) {
    try {
      data = {
        ...data,
        ...event.data.json(),
      };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      {
        body: data.body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        data: {
          url: data.url || "/",
        },
      }
    )
  );
});

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification.data?.url || "/";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((windowClients) => {
          for (const client of windowClients) {
            if ("navigate" in client) {
              client.navigate(url);
            }

            if ("focus" in client) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(url);
          }

          return undefined;
        })
    );
  }
);