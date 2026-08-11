import { onMounted, ref } from "vue";

import { registerWebPush, unregisterWebPush } from "@/lib/firebase/functions";
import {
  getWebPushEndpoint,
  isWebPushConfigured,
  isWebPushSupported,
  subscribeWebPush,
  unsubscribeWebPush,
} from "@/utils/webPush";

const enable = async () => {
  const data = await subscribeWebPush();
  await registerWebPush(data);
};

const disable = async () => {
  const endpoint = await unsubscribeWebPush();
  if (endpoint) {
    await unregisterWebPush({ endpoint });
  }
};

export const useWebPushToggle = () => {
  const webPushConfigured = isWebPushConfigured();
  // iOS Safari はホーム画面に追加した PWA でしか Notification / PushManager を持たない
  const webPushSupported = webPushConfigured && isWebPushSupported();
  const webPushEnabled = ref(false);
  const webPushError = ref(false);
  const updating = ref(false);

  onMounted(async () => {
    if (webPushSupported) {
      webPushEnabled.value = (await getWebPushEndpoint()) !== null;
    }
  });

  const toggleWebPush = async () => {
    if (updating.value) {
      return;
    }
    updating.value = true;
    webPushError.value = false;
    try {
      await (webPushEnabled.value ? disable() : enable());
      webPushEnabled.value = !webPushEnabled.value;
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
