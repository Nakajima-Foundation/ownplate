<template>
  <div v-if="dialog">
    <b-modal :active.sync="isVisible" :width="488">
      <div
        class="op-dialog pt-6 pl-6 pr-6 pb-6 mt-6 mb-6 ml-2 mr-2 bg-white rounded-lg shadow-lg"
      >
        <div class="text-center">
          <i class="material-icons !text-5xl text-red-700">warning</i>
        </div>

        <!-- Error Message -->
        <div v-if="error">
          <!-- Message -->
          <div class="text-center mt-4">
            <div class="font-bold text-xl text-black opacity-60">
              {{ $t("errorPage.popup.title") }}
            </div>
            <div class="mt-2">{{ errorMessage }}</div>
            <div class="mt-2">{{ $t(errorMessage2) }}</div>
          </div>
          <!-- Buttons -->
          <div class="mt-6 text-center">
            <div
              class="px-6 rounded-full h-12 font-bold text-base min-w-[128px] cursor-pointer inline-flex min-h-[36px] items-center justify-center bg-black bg-opacity-5 text-black opacity-60"
              @click="close"
            >
              {{ $t("menu.close") }}
            </div>
          </div>
        </div>

        <!-- Alert Message -->
        <div v-if="alert">
          <!-- Message -->
          <div class="text-center mt-4" v-if="alert.title">
            <div class="font-bold text-xl text-black opacity-60">
              {{ $t(alert.title) }}
            </div>
          </div>
          <div class="text-center mt-4">
            <div class="font-bold text-xl text-black opacity-60">
              {{ $t(alert.code) }}
            </div>
          </div>
          <!-- Buttons -->
          <div class="mt-6 text-center">
            <div
              class="px-6 rounded-full h-12 font-bold text-base min-w-[128px] cursor-pointer inline-flex min-h-[36px] items-center justify-center bg-black bg-opacity-5 text-black opacity-60 mr-4"
              @click="close"
            >
              {{ $t("menu.no") }}
            </div>
            <div
              class="px-6 rounded-full h-12 font-bold text-base min-w-[128px] cursor-pointer inline-flex min-h-[36px] items-center justify-center bg-red-700 text-white"
              @click="handleYes"
            >
              {{ $t("menu.yes") }}
            </div>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import * as Sentry from "@sentry/vue";

export default {
  props: {
    dialog: {
      type: Object,
    },
  },
  data() {
    return {
      isVisible: true,
    };
  },
  watch: {
    dialog() {
      this.isVisible = true; // so that we can re-use this component
    },
    isVisible(newValue) {
      if (!newValue) {
        this.$store.commit("resetDialog");
      }
    },
  },
  computed: {
    alert() {
      return this.dialog?.alert;
    },
    error() {
      return this.dialog?.error;
    },
    errorMessage() {
      Sentry.captureException(this.error?.error);
      if (this.error.message) {
        return this.error.message;
      } else if (this.error.code) {
        return this.$t("errorPage.code." + this.error.code);
      }
      return "";
    },
    errorMessage2() {
      return this.error.message2 || "errorPage.message.generic";
    },
  },
  methods: {
    handleYes() {
      console.log("handleYes");
      this.alert.callback();
      this.isVisible = false;
    },
    close() {
      this.isVisible = false;
    },
  },
};
</script>
