import { onMounted, ref } from "vue";
import { Auth, signOut } from "firebase/auth";
import * as Sentry from "@sentry/vue";

import { registerWebPush, unregisterWebPush } from "@/lib/firebase/functions";
import { settleWithin } from "@/utils/pushReset";
import {
  PushFailure,
  currentDeviceFid,
  isWebPushConfigured,
  isWebPushSupported,
  subscribeThisDevice,
  thisDevicePlatform,
} from "@/utils/webPush";

// FCM の登録を取り、その FID を自分のアカウント配下に記録する
export const enableThisDevice = async (): Promise<PushFailure | null> => {
  const result = await subscribeThisDevice();
  if (!result.ok) {
    return result.reason;
  }
  await registerWebPush({ fid: result.fid, platform: thisDevicePlatform() });
  return null;
};

// 端末側の登録は FCM に残したまま、このアカウント宛の配信先からだけ外す。
//
// 呼ぶ側はサインアウト「前」であること。unregisterWebPush は request.auth から uid を
// 取るので、認証が切れたあとでは必ず失敗し、前のアカウントに登録が残る。
// サインアウト経路は signOutAfterDisablingPush() を通すこと。
// permission で足切りするのは、push を使っていない端末（注文者のページ読み込みを含む）で
// installation を新規作成してしまわないため。currentDeviceFid() は無ければ作る。
export const disableThisDevice = async () => {
  if (
    !isWebPushConfigured() ||
    typeof Notification === "undefined" ||
    Notification.permission !== "granted"
  ) {
    return;
  }
  const fid = await currentDeviceFid();
  if (fid) {
    await unregisterWebPush({ fid });
  }
};

// サインアウトは必ずここを通す。disableThisDevice() を先に済ませないと、
// 共有端末に前のアカウント宛の配信先が残り、次の注文の通知がその端末に届き続ける。
//
// ただし待つのは上限まで。配信先を外すのは callable 1本で、回線次第でいくらでも
// 遅くなりうる。ログアウトの押し心地をそれに引きずられてはいけないし、外せなくても
// サーバ側は次の送信が「宛先が無効」を返した時点で登録を消す。
const DISABLE_TIMEOUT_MS = 3000;

export const signOutAfterDisablingPush = async (auth: Auth) => {
  const disabling = disableThisDevice().catch((e: unknown) => {
    Sentry.captureException(e);
  });
  await settleWithin(disabling, DISABLE_TIMEOUT_MS, (callback, ms) =>
    window.setTimeout(callback, ms),
  );
  await signOut(auth);
};

export const useWebPushToggle = () => {
  const webPushConfigured = isWebPushConfigured();
  const webPushSupported = ref(false);
  const webPushEnabled = ref(false);
  const webPushError = ref(false);
  const updating = ref(false);

  onMounted(async () => {
    if (!webPushConfigured) {
      return;
    }
    // iOS Safari のタブではホーム画面に追加した PWA でないと false になる
    webPushSupported.value = await isWebPushSupported();
    webPushEnabled.value =
      typeof Notification !== "undefined" &&
      Notification.permission === "granted" &&
      (await currentDeviceFid()) !== "";
  });

  const toggleWebPush = async () => {
    if (updating.value) {
      return;
    }
    updating.value = true;
    webPushError.value = false;
    try {
      if (webPushEnabled.value) {
        await disableThisDevice();
        webPushEnabled.value = false;
      } else {
        const failure = await enableThisDevice();
        webPushError.value = failure !== null;
        webPushEnabled.value = failure === null;
      }
    } catch (e) {
      console.error("failed to toggle web push", e);
      webPushError.value = true;
    }
    updating.value = false;
  };

  return {
    webPushConfigured,
    webPushSupported,
    webPushEnabled,
    webPushError,
    toggleWebPush,
  };
};
