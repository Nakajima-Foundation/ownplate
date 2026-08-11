const DEFAULT_TAG = "ownplate";
const ICON_PATH = "/android-chrome-192x192.png";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Chrome only offers the install prompt to a service worker that has a fetch
// handler. Nothing is cached here, so this stays a pass-through.
self.addEventListener("fetch", () => {});

const readPushData = (event) => {
  try {
    return event.data ? event.data.json() : {};
  } catch (e) {
    console.error("sw: unparsable push payload", e);
    return {};
  }
};

self.addEventListener("push", (event) => {
  const data = readPushData(event);
  event.waitUntil(
    self.registration.showNotification(data.title || "", {
      body: data.body || "",
      icon: ICON_PATH,
      badge: ICON_PATH,
      tag: data.tag || DEFAULT_TAG,
      data: { url: data.url || "/" },
      requireInteraction: true,
    }),
  );
});

const focusOrOpen = async (url) => {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  const opened = clients.find((client) =>
    client.url.startsWith(self.location.origin),
  );
  if (!opened) {
    await self.clients.openWindow(url);
    return;
  }
  await opened.focus();
  try {
    await opened.navigate(url);
  } catch (e) {
    // navigate() is unavailable in some browsers; the focused tab stays put.
    console.error("sw: navigate failed", e);
  }
};

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = event.notification.data?.url || "/";
  event.waitUntil(focusOrOpen(new URL(path, self.location.origin).href));
});
