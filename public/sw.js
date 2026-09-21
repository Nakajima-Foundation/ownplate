/* PWA シェルと FCM のバックグラウンド受信を兼ねる単一の Service Worker。
 * 静的ファイルなのでアプリのモジュールを import できず、Firebase は compat SDK を
 * CDN から読む。firebaseConfig は環境ごとに違うため、登録時のクエリで受け取る
 * (src/utils/webPush.ts)。ここに直接書くと dev / 本番で別ファイルが必要になる。 */
importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js",
);

const DEFAULT_TITLE = "おもちかえり.com";
const ICON_PATH = "/android-chrome-192x192.png";
const DEFAULT_TAG = "ownplate";

const readConfig = () => {
  try {
    const raw = new URL(self.location.href).searchParams.get("config");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("sw: unreadable firebase config", e);
    return null;
  }
};

const showPush = (data) =>
  self.registration.showNotification(data.title || DEFAULT_TITLE, {
    body: data.body || "",
    icon: ICON_PATH,
    badge: ICON_PATH,
    tag: data.tag || DEFAULT_TAG,
    data,
    requireInteraction: true,
  });

const config = readConfig();
if (config) {
  firebase.initializeApp(config);
  // data のみの push を送っているので、表示はここで組み立てる。notification ブロックを
  // 付けると SDK が独自に出してしまい、通知が二重になり tap も奪われる。
  firebase.messaging().onBackgroundMessage((payload) => {
    showPush(payload.data || {});
  });
}

// Chrome がインストール導線を出す条件を満たすためだけの空ハンドラ。
// respondWith を呼ばないので、資産のキャッシュには一切関与しない。
self.addEventListener("fetch", () => {});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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
    // navigate() が使えないブラウザもある。その場合はフォーカスだけして留まる。
    console.error("sw: navigate failed", e);
  }
};

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = event.notification.data?.url || "/";
  event.waitUntil(focusOrOpen(new URL(path, self.location.origin).href));
});
