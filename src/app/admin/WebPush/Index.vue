<template>
  <div class="mx-6 mt-6 mb-20">
    <div class="text-xl font-bold text-black/40">
      {{ $t("admin.webpush.title") }}
    </div>

    <!-- Status -->
    <div class="mt-4 rounded-lg bg-white p-4 shadow">
      <div class="mb-2 text-sm font-bold text-black/60">
        {{ $t("admin.webpush.statusHeading") }}
      </div>
      <dl class="text-sm">
        <div class="flex py-1">
          <dt class="w-40 text-black/60">
            {{ $t("admin.webpush.configured") }}
          </dt>
          <dd>{{ configured ? "OK" : $t("admin.webpush.notConfigured") }}</dd>
        </div>
        <div class="flex py-1">
          <dt class="w-40 text-black/60">
            {{ $t("admin.webpush.supported") }}
          </dt>
          <dd>{{ supported ? "OK" : $t("admin.webpush.notSupported") }}</dd>
        </div>
        <div class="flex py-1">
          <dt class="w-40 text-black/60">
            {{ $t("admin.webpush.permission") }}
          </dt>
          <dd>{{ permission }}</dd>
        </div>
        <div class="flex py-1">
          <dt class="w-40 text-black/60">
            {{ $t("admin.webpush.currentDevice") }}
          </dt>
          <dd class="break-all">{{ fid || $t("admin.webpush.noDevice") }}</dd>
        </div>
      </dl>
      <div class="mt-2 text-xs text-black/60">
        {{ $t("admin.webpush.iosHint") }}
      </div>
    </div>

    <!-- Registration -->
    <div class="mt-4 rounded-lg bg-white p-4 shadow">
      <div class="mb-2 text-sm font-bold text-black/60">
        {{ $t("admin.webpush.registrationHeading") }}
      </div>
      <input
        v-model="restaurantId"
        class="mb-2 w-full rounded-lg border border-teal-400 px-3 py-2"
        :placeholder="$t('admin.webpush.restaurantId')"
      />
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-green-600/10 px-4"
          @click="onRegister()"
        >
          <span class="text-sm font-bold text-green-600">
            {{ $t("admin.webpush.register") }}
          </span>
        </button>
      </div>
    </div>

    <!-- Send -->
    <div class="mt-4 rounded-lg bg-white p-4 shadow">
      <div class="mb-2 text-sm font-bold text-black/60">
        {{ $t("admin.webpush.sendHeading") }}
      </div>
      <input
        v-model="title"
        class="mb-2 w-full rounded-lg border border-teal-400 px-3 py-2"
        :placeholder="$t('admin.webpush.sendTitle')"
      />
      <input
        v-model="body"
        class="mb-2 w-full rounded-lg border border-teal-400 px-3 py-2"
        :placeholder="$t('admin.webpush.sendBody')"
      />
      <button
        type="button"
        class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-black/5 px-4"
        @click="onSend()"
      >
        <span class="text-op-teal text-sm font-bold">
          {{ $t("admin.webpush.send") }}
        </span>
      </button>
    </div>

    <!-- Callable interference probe -->
    <div class="mt-4 rounded-lg bg-white p-4 shadow">
      <div class="mb-2 text-sm font-bold text-black/60">
        {{ $t("admin.webpush.probeHeading") }}
      </div>
      <div class="mb-2 text-xs text-black/60">
        {{ $t("admin.webpush.probeHint") }}
      </div>
      <button
        type="button"
        class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-black/5 px-4"
        @click="onProbe()"
      >
        <span class="text-op-teal text-sm font-bold">
          {{ $t("admin.webpush.probe") }}
        </span>
      </button>
    </div>

    <!-- Log -->
    <div class="mt-4 rounded-lg bg-white p-4 shadow">
      <div class="mb-2 text-sm font-bold text-black/60">
        {{ $t("admin.webpush.logHeading") }}
      </div>
      <pre
        class="max-h-80 overflow-auto rounded bg-black/5 p-2 text-xs whitespace-pre-wrap"
        >{{ log.join("\n") || "-" }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

import {
  createPushInvite,
  ping,
  redeemPushInvite,
  sendTestWebPush,
} from "@/lib/firebase/functions";
import { describeSendResult } from "@/utils/pushFormat";
import {
  ADMIN_SCOPE,
  currentDeviceFid,
  isWebPushConfigured,
  isWebPushSupported,
  subscribeThisDevice,
  thisDevicePlatform,
} from "@/utils/webPush";

export default defineComponent({
  setup() {
    const configured = isWebPushConfigured();
    const supported = ref(false);
    const permission = ref("unavailable");
    const fid = ref("");
    const title = ref("テスト通知");
    const body = ref("おもちかえり.com");
    const log = ref<string[]>([]);
    const restaurantId = ref("");

    const note = (message: string) => {
      log.value.unshift(`${new Date().toLocaleTimeString()}  ${message}`);
    };

    const refresh = async () => {
      supported.value = await isWebPushSupported();
      permission.value =
        typeof Notification === "undefined"
          ? "unavailable"
          : Notification.permission;
      fid.value = await currentDeviceFid();
    };

    onMounted(async () => {
      await refresh();
      note(
        `configured=${configured} supported=${supported.value} permission=${permission.value}`,
      );
      const swReg = await navigator.serviceWorker?.getRegistration();
      note(
        `sw scope=${swReg?.scope ?? "none"} active=${swReg?.active?.state ?? "none"}`,
      );
    });

    // 本番の登録はワンタイム URL 経由。ここは管理者なので招待を作ってその場で使い、
    // createPushInvite2 と redeemPushInvite2 の両方を一度に通す。
    const onRegister = async () => {
      try {
        const result = await subscribeThisDevice(ADMIN_SCOPE);
        if (!result.ok) {
          note(`register failed: ${result.reason}`);
          return;
        }
        const { data: invite } = await createPushInvite({
          restaurantId: restaurantId.value,
        });
        note(`invite ${invite.url}`);
        await redeemPushInvite({
          token: invite.url.split("/").pop() ?? "",
          fid: result.fid,
          platform: thisDevicePlatform(),
          name: "webpush test page",
        });
        note(`registered fid=${result.fid}`);
        await refresh();
      } catch (e) {
        note(`register error: ${e}`);
      }
    };

    const onSend = async () => {
      try {
        const { data } = await sendTestWebPush({
          restaurantId: restaurantId.value,
          title: title.value,
          body: body.value,
        });
        const codes = data.codes.length
          ? ` codes=[${data.codes.join(", ")}]`
          : "";
        note(
          `${describeSendResult(data.sent, data.targets)} failed=${data.failed}${codes}`,
        );
      } catch (e) {
        note(`send error: ${e}`);
      }
    };

    // httpsCallable が内部で messaging.getToken() を呼び、FID を送信先として
    // 無効化するかどうかの切り分け。叩いたあとに送信して届けば解消している。
    const onProbe = async () => {
      try {
        await ping({
          restaurantId: restaurantId.value || "index",
          operationType: "webpushProbe",
          pathName: "/admin/webpush",
        });
        note("called a normal httpsCallable (ping). now press send.");
      } catch (e) {
        note(`probe error: ${e}`);
      }
    };

    return {
      restaurantId,
      configured,
      supported,
      permission,
      fid,
      title,
      body,
      log,
      onRegister,
      onSend,
      onProbe,
    };
  },
});
</script>
