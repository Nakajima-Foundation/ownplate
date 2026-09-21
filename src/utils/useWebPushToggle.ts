import { onMounted, ref } from "vue";

import { registerWebPush, unregisterWebPush } from "@/lib/firebase/functions";
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

// 端末側の登録は FCM に残したまま、このアカウント宛の配信先からだけ外す
export const disableThisDevice = async () => {
  const fid = await currentDeviceFid();
  if (fid) {
    await unregisterWebPush({ fid });
  }
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
