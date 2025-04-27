<template>
  <div v-if="dialog">
    <o-modal v-model:active="isVisible" :width="488">
      <div
        class="op-dialog my-6 mx-2 rounded-lg bg-white pt-6 pl-6 pr-6 pb-6 shadow-lg"
      >
        <div v-if="tips && tips.key">
          <DialogTips :tipsKey="tips.key" @close="close" />
        </div>
        <div v-else>
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
                class="inline-flex h-12 min-h-[36px] min-w-[128px] cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-5 px-6 text-base font-bold text-black opacity-60"
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
                class="mr-4 inline-flex h-12 min-h-[36px] min-w-[128px] cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-5 px-6 text-base font-bold text-black opacity-60"
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
      </div>
    </o-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import * as Sentry from "@sentry/vue";
import DialogTips from "@/components/DialogTips.vue";

import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    DialogTips,
  },
  props: {
    dialog: {
      type: Object,
    },
  },
  setup(props) {
    const { t } = useI18n({ useScope: "global" });
    const store = useStore();
    const isVisible = ref(true);

    const dialogObj = computed(() => {
      return props.dialog;
    });
    watch(dialogObj, () => {
      isVisible.value = true; // so that we can re-use this component
    });
    watch(isVisible, (newValue) => {
      if (!newValue) {
        store.commit("resetDialog");
      }
    });

    const alert = computed(() => {
      return props.dialog?.alert;
    });
    const error = computed(() => {
      return props.dialog?.error;
    });
    const tips = computed(() => {
      return props.dialog?.tips;
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
    const handleYes = () => {
      console.log("handleYes");
      alert.value.callback();
      isVisible.value = false;
    };
    const close = () => {
      isVisible.value = false;
    };
    return {
      isVisible,
      alert,
      error,
      tips,
      errorMessage,
      errorMessage2,
      handleYes,
      close,
    };
  },
});
</script>
