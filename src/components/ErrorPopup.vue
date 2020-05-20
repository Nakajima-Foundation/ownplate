<template>
  <div v-if="error">
    <b-modal :active.sync="isVisible" :width="488">
      <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
        <div class="t-h6 c-text-black-disabled p-b-8">{{$t('errorPage.popup.title')}}</div>
        <div class="m-t-8">{{message}}</div>
        <div class="m-t-8">{{$t("errorPage.popup.message1")}}</div>
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
  computed: {
    message() {
      if (this.error.message) {
        return this.error.message;
      } else if (this.error.code) {
        return this.$t("errorPage.code." + this.error.code);
      }
      return "";
    }
  },
  methods: {
    close() {
      this.isVisible = false;
    }
  }
};
</script>
