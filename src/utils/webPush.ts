import {
  deleteInstallations,
  getId,
  getInstallations,
} from "firebase/installations";
import {
  Messaging,
  getMessaging,
  isSupported,
  onMessage,
  onRegistered,
  register,
} from "firebase/messaging";

import { firebaseConfig, webPushVapidPublicKey } from "@/config/project";
import firebaseApp from "@/lib/firebase/firebase9";
import { detectPlatform } from "@/utils/pushFormat";
import { resetRegistrationState } from "@/utils/pushReset";

const SERVICE_WORKER_PATH = "/sw.js";
const ADMIN_SCOPE = "/admin/";
const REGISTER_TIMEOUT_MS = 10000;
const NOTIFICATION_ICON = "/android-chrome-192x192.png";
const DEFAULT_NOTIFICATION_TITLE = "おもちかえり.com";

export type PushFailure =
  "unconfigured" | "unsupported" | "denied" | "dismissed" | "no-fid";
export type PushResult =
  { ok: true; fid: string } | { ok: false; reason: PushFailure };

export const isWebPushConfigured = () => webPushVapidPublicKey.length > 0;

// iOS の素の Safari タブでは false、ホーム画面に追加した PWA と Android Chrome で true
export const isWebPushSupported = () => isSupported();

// Service Worker は静的ファイルでアプリの設定を import できないので、
// firebaseConfig をクエリで渡す。環境ごとに sw.js を作り分けずに済む。
const serviceWorkerUrl = () =>
  `${SERVICE_WORKER_PATH}?config=${encodeURIComponent(JSON.stringify(firebaseConfig))}`;

export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }
  try {
    // scope を /admin/ に絞る。注文者が開くページは Service Worker の管理下に入らない。
    return await navigator.serviceWorker.register(serviceWorkerUrl(), {
      scope: ADMIN_SCOPE,
    });
  } catch (e) {
    console.error("failed to register the service worker", e);
    return null;
  }
};

// 既に granted のときに再度聞かない。クリックの transient activation を外れた
// 再プロンプトは問い合わせなく拒否され、許可済み端末の再有効化が denied で返る。
const ensurePermission = async (): Promise<PushFailure | null> => {
  if (typeof Notification === "undefined") {
    return "unsupported";
  }
  if (Notification.permission === "granted") {
    return null;
  }
  const answer = await Notification.requestPermission();
  if (answer === "granted") {
    return null;
  }
  // "default" は拒否ではなくダイアログを閉じただけ。denied と混ぜると、
  // 設定されていないブロックを探すことになる。
  return answer === "denied" ? "denied" : "dismissed";
};

const checkPreconditions = async (): Promise<PushFailure | null> => {
  if (!isWebPushConfigured()) {
    return "unconfigured";
  }
  // permission を await より先に取る。requestPermission はクリックの transient
  // activation を必要とし、isSupported() は IndexedDB を開くのでそれを使い切る。
  const permissionFailure = await ensurePermission();
  if (permissionFailure) {
    return permissionFailure;
  }
  if (!(await isSupported())) {
    return "unsupported";
  }
  return null;
};

// FID は onRegistered 経由で届く。
//
// ハンドラは一度張ったら外さない。SDK の register() は通知を送る「あと」にも
// onRegisteredHandler の存在を確認し、さらに installation id が変わると SDK 自身が
// register() をもう一本キューに積む。FID を受け取った時点で解除すると、後続の
// リンクがハンドラを見失って invalid-on-registered-handler で落ちる。
let fidWaiters: Array<(fid: string) => void> = [];
let onRegisteredAttached = false;

const attachOnRegistered = (messaging: Messaging) => {
  if (onRegisteredAttached) {
    return;
  }
  onRegisteredAttached = true;
  onRegistered(messaging, (fid) => {
    const waiting = fidWaiters;
    fidWaiters = [];
    waiting.forEach((notify) => notify(fid));
  });
};

const nextFid = (messaging: Messaging): Promise<string | null> =>
  new Promise((resolve) => {
    attachOnRegistered(messaging);
    let settled = false;
    const finish = (fid: string | null) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(fid);
    };
    const waiter = (fid: string) => finish(fid);
    fidWaiters.push(waiter);
    window.setTimeout(() => {
      // 待ち受けを畳む。放置すると次回の通知で解決済みの Promise を触りにいく。
      fidWaiters = fidWaiters.filter((entry) => entry !== waiter);
      finish(null);
    }, REGISTER_TIMEOUT_MS);
  });

// FCM が既に落とした登録はここからは見えない。register() は自前のキャッシュから
// 成功を返すため、送信時まで判明しない。キャッシュの鍵になっている2つの入力
// （installation id と購読）を先に落とすことで、確実に再登録させる。
// どちらも失敗しうるので best-effort。警告だけ出して登録は続行する。
const resetBeforeRegistering = (registration: ServiceWorkerRegistration) =>
  resetRegistrationState({
    dropSubscription: async () => {
      const subscription = await registration.pushManager.getSubscription();
      return subscription?.unsubscribe();
    },
    rotateInstallation: () =>
      deleteInstallations(getInstallations(firebaseApp)),
    onFailure: (reason) =>
      console.warn("push registration reset failed", reason),
  });

const acquireFid = async (registration: ServiceWorkerRegistration) => {
  const messaging = getMessaging(firebaseApp);
  const pending = nextFid(messaging);
  try {
    await register(messaging, {
      vapidKey: webPushVapidPublicKey,
      serviceWorkerRegistration: registration,
    });
  } catch (e) {
    console.error("FCM register() failed", e);
    return null;
  }
  return pending;
};

export const subscribeThisDevice = async (): Promise<PushResult> => {
  const failure = await checkPreconditions();
  if (failure) {
    return { ok: false, reason: failure };
  }
  const registration = await registerServiceWorker();
  if (!registration) {
    return { ok: false, reason: "unsupported" };
  }
  await resetBeforeRegistering(registration);
  const fid = await acquireFid(registration);
  return fid ? { ok: true, fid } : { ok: false, reason: "no-fid" };
};

// このブラウザを識別する FID。登録 doc の id でもあるので、端末一覧で
// 「この端末」を見分けるのに使う。
export const currentDeviceFid = async () => {
  if (!isWebPushConfigured()) {
    return "";
  }
  try {
    return await getId(getInstallations(firebaseApp));
  } catch (e) {
    console.error("failed to read the installation id", e);
    return "";
  }
};

export const thisDevicePlatform = () => detectPlatform(navigator.userAgent);

// FCM は同一オリジンのタブが1つでもフォーカスされていると onBackgroundMessage ではなく
// onMessage に回すため、前面時は自分で表示しないと何も出ない。
export const listenForegroundPush = async () => {
  if (!isWebPushConfigured() || !(await isSupported())) {
    return;
  }
  onMessage(getMessaging(firebaseApp), (payload) => {
    const data = payload.data ?? {};
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(data.title || DEFAULT_NOTIFICATION_TITLE, {
        body: data.body ?? "",
        icon: NOTIFICATION_ICON,
        tag: data.tag,
        data,
      });
    });
  });
};
