<template>
  <div v-if="dialog">
    <b-modal :active.sync="isVisible" :width="488">
      <div v-if="error" class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
        <div class="t-h6 c-text-black-disabled p-b-8">
          <i class="fas fa-exclamation-triangle"></i>
          {{$t('errorPage.popup.title')}}
        </div>
        <div class="m-t-8">{{errorMessage}}</div>
        <div class="m-t-8">{{$t(errorMessage2)}}</div>
        <div class="m-t-24 align-center">
          <div class="op-button-small tertiary" @click="close">{{$t('menu.close')}}</div>
        </div>
      </div>
      <div v-if="alert" class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
        <div class="t-h6 c-text-black-disabled p-b-8">
          <i class="fas fa-exclamation-triangle"></i>
          {{$t(alert.code)}}
        </div>
        <div class="m-t-24 align-center">
          <div class="op-button-small tertiary" @click="close">{{$t('menu.close')}}</div>
          <div
            class="op-button-small bg-status-red c-text-white-full"
            @click="handleYes"
          >{{$t('menu.yes')}}</div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import * as Sentry from "@sentry/browser";

export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      isVisible: true
    };
  },
  watch: {
    dialog() {
      this.isVisible = true; // so that we can re-use this component
    }
  },
  computed: {
    alert() {
      return this.dialog?.alert;
    },
    error() {
      return this.dialog?.error;
    },
    errorMessage() {
      Sentry.captureException(this.error);
      if (this.error.message) {
        return this.error.message;
      } else if (this.error.code) {
        return this.$t("errorPage.code." + this.error.code);
      }
      return "";
    },
    errorMessage2() {
      return this.error.message2 || "errorPage.message.generic";
    }
  },
  methods: {
    handleYes() {
      console.log("handleYes");
    },
    close() {
      this.isVisible = false;
    }
  }
};
</script>
