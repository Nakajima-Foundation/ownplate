<template>
  <div class="mx-auto max-w-lg px-6 py-10">
    <div class="text-xl font-bold text-black/60">
      {{ $t("pushDevice.title") }}
    </div>

    <!-- 完了 -->
    <div v-if="registered" class="mt-6 rounded-lg bg-white p-4 shadow-sm">
      <div class="flex items-center text-green-600">
        <i class="material-icons mr-2 text-2xl">check_circle</i>
        <div class="text-base font-bold">{{ $t("pushDevice.done") }}</div>
      </div>
      <div class="mt-2 text-sm text-black/60">
        {{ $t("pushDevice.doneHint") }}
      </div>
    </div>

    <!-- 招待が使えないときは、登録の導線そのものを出さない -->
    <div
      v-else-if="statusMessage"
      class="mt-6 rounded-lg bg-white p-4 shadow-sm"
    >
      <div
        class="flex items-center"
        :class="
          status === 'registered-here' ? 'text-green-600' : 'text-black/60'
        "
      >
        <i class="material-icons mr-2 text-2xl">{{
          status === "registered-here" ? "check_circle" : "error_outline"
        }}</i>
        <div class="text-base font-bold">{{ statusMessage }}</div>
      </div>
    </div>

    <!-- iOS はホーム画面に追加しないと通知そのものを受け取れない -->
    <div
      v-else-if="needsHomeScreen"
      class="mt-6 rounded-lg bg-white p-4 shadow-sm"
    >
      <div class="text-base font-bold text-black/60">
        {{ $t("pushDevice.installHeading") }}
      </div>
      <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm text-black/60">
        <li>{{ $t("pushDevice.installStep1") }}</li>
        <li>{{ $t("pushDevice.installStep2") }}</li>
        <li>{{ $t("pushDevice.installStep3") }}</li>
      </ol>
    </div>

    <!-- 登録 -->
    <div v-else-if="status === 'usable'" class="mt-6">
      <div class="text-sm text-black/60">
        {{ $t("pushDevice.nameHint") }}
      </div>
      <input
        v-model="name"
        class="mt-2 w-full rounded-lg border border-teal-400 px-3 py-2"
        :placeholder="$t('pushDevice.namePlaceholder')"
        :maxlength="MAX_DEVICE_NAME_LENGTH"
      />
      <div class="mt-4 text-center">
        <button
          type="button"
          class="cursor-pointer"
          :disabled="working"
          @click="handleRegister"
        >
          <div
            class="bg-op-teal inline-flex h-12 items-center justify-center rounded-full px-6"
            :class="working ? 'opacity-50' : ''"
          >
            <div class="text-base font-bold text-white">
              {{ $t("pushDevice.register") }}
            </div>
          </div>
        </button>
      </div>
      <div v-if="error" class="mt-4 text-sm font-bold text-red-700">
        {{ error }}
      </div>
    </div>

    <!-- Loading -->
    <Loading v-if="working" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";

import Loading from "@/components/Loading.vue";
import type { PushInviteStatus } from "@/models/functionTypes";
import { checkPushInvite, redeemPushInvite } from "@/lib/firebase/functions";
import {
  PUSH_DEVICE_SCOPE,
  currentDeviceFid,
  isWebPushSupported,
  subscribeThisDevice,
  thisDevicePlatform,
} from "@/utils/webPush";
import { MAX_DEVICE_NAME_LENGTH } from "@/utils/pushFormat";

export default defineComponent({
  components: {
    Loading,
  },
  setup() {
    const route = useRoute();
    const { t } = useI18n({ useScope: "global" });

    const token = computed(() => String(route.params.token ?? ""));
    const supported = ref<boolean | null>(null);
    const status = ref<PushInviteStatus | null>(null);
    const registered = ref(false);
    const working = ref(false);
    const name = ref("");
    const error = ref("");

    // 判定できるまでは案内を出さない。null のまま「追加してください」と出すと、
    // 対応している端末にも無関係な手順を読ませることになる。
    const needsHomeScreen = computed(() => supported.value === false);

    // iOS はここで manifest を見つけられないとホーム画面に追加しても standalone に
    // ならない。start_url にトークンが要るので、静的ファイルではなくその場で作る。
    const manifestHref = computed(() => {
      const manifest = {
        // iOS は通知に「from <ここ>」を出し、ホーム画面のアイコン名にも使う。
        // ページのタイトルを入れると「from 通知を受け取る端末の登録」になる。
        name: t("pushDevice.appName"),
        short_name: t("pushDevice.appShortName"),
        start_url: `${PUSH_DEVICE_SCOPE}${token.value}`,
        scope: PUSH_DEVICE_SCOPE,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0097a7",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      };
      return URL.createObjectURL(
        new Blob([JSON.stringify(manifest)], {
          type: "application/manifest+json",
        }),
      );
    });

    useHead(() => ({
      title: t("pushDevice.title"),
      link: [{ rel: "manifest", href: manifestHref.value }],
      meta: [
        { name: "theme-color", content: "#0097a7" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
      ],
    }));

    // 招待の状態を「押す前に」確かめる。押してからでは遅い — 登録手順は先に
    // installation id を回すので、そこで招待が弾かれると、動いていた端末の
    // 登録が死んだまま戻せなくなる。PWA の start_url がこの URL なので、
    // ホーム画面から起動するたびにこの画面に戻ってくる。
    const refreshStatus = async () => {
      try {
        const { data } = await checkPushInvite({
          token: token.value,
          fid: await currentDeviceFid(),
        });
        status.value = data.status;
      } catch (e) {
        console.error("failed to check the push invite", e);
        status.value = "not-found";
      }
    };

    onMounted(async () => {
      supported.value = await isWebPushSupported();
      await refreshStatus();
    });

    const handleRegister = async () => {
      if (working.value) {
        return;
      }
      working.value = true;
      error.value = "";
      try {
        // 破壊的な手順に入る直前にもう一度見る。画面を開いたまま別の端末に
        // 使われている場合がある。
        await refreshStatus();
        if (status.value !== "usable") {
          working.value = false;
          return;
        }
        const result = await subscribeThisDevice(PUSH_DEVICE_SCOPE);
        if (!result.ok) {
          error.value = t(`pushDevice.failure.${result.reason}`);
          working.value = false;
          return;
        }
        await redeemPushInvite({
          token: token.value,
          fid: result.fid,
          platform: thisDevicePlatform(),
          name: name.value,
        });
        registered.value = true;
        status.value = "registered-here";
      } catch (e) {
        console.error("failed to redeem the push invite", e);
        error.value = t("pushDevice.failure.invite");
      }
      working.value = false;
    };

    const statusMessage = computed(() =>
      status.value && status.value !== "usable"
        ? t(`pushDevice.status.${status.value}`)
        : "",
    );

    return {
      MAX_DEVICE_NAME_LENGTH,
      status,
      statusMessage,
      needsHomeScreen,
      registered,
      working,
      name,
      error,
      handleRegister,
    };
  },
});
</script>
