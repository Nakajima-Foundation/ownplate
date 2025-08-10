<template>
  <t-modal :active="isVisible" @update:active="close">
    <div
      class="op-dialog mx-2 my-6 rounded-lg bg-white pt-6 pr-6 pb-6 pl-6 shadow-lg"
    >
      <div class="text-center">
        <i class="material-icons text-5xl! text-red-700">warning</i>
      </div>

      <!-- Error Message -->
      <div v-if="error">
        <!-- Message -->
        <div class="mt-4 text-center">
          <div class="text-xl font-bold text-black opacity-60">
            {{ $t("errorPage.popup.title") }}
          </div>
          <div class="mt-2">{{ errorMessage }}</div>
          <div class="mt-2">{{ $t(errorMessage2) }}</div>
        </div>
        <!-- Buttons -->
        <div class="mt-4 text-center">
          <div
            class="inline-flex h-12 min-h-[36px] min-w-[128px] cursor-pointer items-center justify-center rounded-full bg-black/5 px-6 text-base font-bold text-black opacity-60"
            @click="close"
          >
            {{ $t("menu.close") }}
          </div>
        </div>
      </div>

      <!-- Alert Message -->
      <div v-if="alert">
        <!-- Message -->
        <div class="mt-4 text-center" v-if="alert.title">
          <div class="text-xl font-bold text-black opacity-60">
            {{ $t(alert.title) }}
          </div>
        </div>
        <div class="mt-4 text-center">
          <div class="text-xl font-bold text-black opacity-60">
            {{ $t(alert.code) }}
          </div>
        </div>
        <!-- Buttons -->
        <div class="mt-4 text-center">
          <div
            class="mr-4 inline-flex h-12 min-h-[36px] min-w-[128px] cursor-pointer items-center justify-center rounded-full bg-black/5 px-6 text-base font-bold text-black opacity-60"
            @click="close"
          >
            {{ $t("menu.no") }}
          </div>
          <div
            class="inline-flex h-12 min-h-[36px] min-w-[128px] cursor-pointer items-center justify-center rounded-full bg-red-700 px-6 text-base font-bold text-white"
            @click="handleYes"
          >
            {{ $t("menu.yes") }}
          </div>
        </div>
      </div>
    </div>
  </t-modal>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import * as Sentry from "@sentry/vue";

import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const { t } = useI18n({ useScope: "global" });
    const store = useStore();

    const dialog = computed(() => {
      return store.state.dialog;
    });

    const alert = computed(() => {
      return dialog.value?.alert;
    });
    const error = computed(() => {
      return dialog.value?.error;
    });
    const isVisible = computed(() => {
      return !!(error.value || alert.value);
    });
    const errorMessage = computed(() => {
      Sentry.captureException(error.value?.error);
      if (error.value.message) {
        return error.value.message;
      } else if (error.value.code) {
        return t("errorPage.code." + error.value.code);
      }
      return "";
    });
    const errorMessage2 = computed(() => {
      return error.value.message2 || "errorPage.message.generic";
    });
    const close = () => {
      store.commit("resetDialog");
    };
    const handleYes = () => {
      console.log("handleYes");
      alert.value.callback();
      close();
    };
    return {
      isVisible,
      dialog,
      alert,
      error,
      errorMessage,
      errorMessage2,
      handleYes,
      close,
    };
  },
});
</script>
