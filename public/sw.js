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
    // badge は渡さない。Android はこれを白一色のマスクとして描くので、色付きの
    // ロゴを渡すとステータスバーに白い四角が出るだけになる。単色の専用素材が
    // 用意できるまではブラウザ既定に任せる。
    // tag は付けない。同じ tag の通知は既存を置き換えるだけで再通知されず、
    // 実機で「1通目だけ出て以降沈黙する」状態になった。
    data,
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

// 再利用するタブは、その通知の行き先と同じ区画のものだけに絞る。
// includeUncontrolled は scope の外にある同一オリジンのページも返すので、絞らないと
// 管理画面の通知が、注文者の開いている店舗ページを奪ってしまう。
//
// 区画は通知自身の url の先頭セグメントから取る。/admin/ を定数で持たないのは、
// 注文者向けの通知（/u/... など）を足すときにこのファイルを直さずに済ませるため。
// 行き先が "/" のように区画を持たない場合は、既存のタブを触らず新しく開く。
const reuseScope = (url) => {
  const segment = new URL(url).pathname.split("/")[1];
  return segment ? `${self.location.origin}/${segment}/` : null;
};

const focusOrOpen = async (url) => {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  const prefix = reuseScope(url);
  const opened = prefix
    ? clients.find((client) => client.url.startsWith(prefix))
    : undefined;
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
