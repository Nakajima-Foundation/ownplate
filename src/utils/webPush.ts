import { webPushVapidPublicKey } from "@/config/project";
import { RegisterWebPushData } from "@/models/functionTypes";

const SERVICE_WORKER_PATH = "/sw.js";

export const isWebPushSupported = () => {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
};

export const isWebPushConfigured = () => {
  return webPushVapidPublicKey !== "";
};

export const registerServiceWorker = async () => {
  if (!isWebPushSupported()) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  } catch (e) {
    console.error("failed to register " + SERVICE_WORKER_PATH, e);
    return null;
  }
};

const urlBase64ToUint8Array = (base64: string) => {
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = window.atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(Array.from(binary).map((char) => char.charCodeAt(0)));
};

const toRegisterData = (
  subscription: PushSubscription,
): RegisterWebPushData => {
  const { endpoint, keys } = subscription.toJSON();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error("web push: subscription is missing endpoint or keys");
  }
  return { endpoint, p256dh: keys.p256dh, auth: keys.auth };
};

const getRegistration = async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  return registration ?? (await registerServiceWorker());
};

// pushManager.subscribe() は active な worker を要求するので、install 完了まで待つ
const getActiveRegistration = async () => {
  const registration = await getRegistration();
  if (!registration) {
    throw new Error("web push: service worker is unavailable");
  }
  return await navigator.serviceWorker.ready;
};

export const getWebPushEndpoint = async () => {
  if (!isWebPushSupported()) {
    return null;
  }
  const registration = await getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return subscription?.endpoint ?? null;
};

export const subscribeWebPush = async (): Promise<RegisterWebPushData> => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("web push: notification permission was not granted");
  }
  const registration = await getActiveRegistration();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(webPushVapidPublicKey),
  });
  return toRegisterData(subscription);
};

export const unsubscribeWebPush = async () => {
  if (!isWebPushSupported()) {
    return null;
  }
  const registration = await getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) {
    return null;
  }
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  return endpoint;
};
