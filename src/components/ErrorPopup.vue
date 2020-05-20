<template>
  <div v-if="error">
    <b-modal :active.sync="isVisible" :width="488">
      <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
        <div class="t-h6 c-text-black-disabled p-b-8">
          <i class="fas fa-exclamation-triangle"></i>
          {{$t('errorPage.popup.title')}}
        </div>
        <div class="m-t-8">{{message}}</div>
        <div class="m-t-8">{{$t(message2)}}</div>
        <div class="m-t-24 align-center">
          <div class="op-button-small tertiary" @click="close">{{$t('menu.close')}}</div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object
    }
  },
  data() {
    return {
      isVisible: true
    };
  },
  watch: {
    error() {
      this.isVisible = true; // so that we can re-use this component
    }
  },
  computed: {
    message() {
      if (this.error.message) {
        return this.error.message;
      } else if (this.error.code) {
        return this.$t("errorPage.code." + this.error.code);
      }
      return "";
    },
    message2() {
      return this.error.message2 || "errorPage.message.generic";
    }
  },
  methods: {
    close() {
      this.isVisible = false;
    }
  }
};
</script>
