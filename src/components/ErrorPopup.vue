<template>
  <div v-if="error">
    <b-modal :active.sync="isVisible" :width="640">
      <div class="card">
        <div class="card-content">
          <h1>{{$t('errorPage.popup.title')}}</h1>
          <p>{{message}}</p>
          <p>{{$t("errorPage.popup.message1")}}</p>
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
  }
};
</script>
