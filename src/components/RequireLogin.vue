<template>
<div>
  <div class="notFoundPageText">
    {{$t('errorPage.requireLogin.message1')}}
  </div>
  <div>
    <b-modal :active.sync="loginVisible" :width="640">
      <div class="card">
        <div class="card-content">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </div>
    </b-modal>
  </div>
</div>
</template>
<script>
import PhoneLogin from "~/app/auth/PhoneLogin";
export default {
  components: {
    PhoneLogin,
  },
  props: {
    handleDismissed: {
      type: Function,
      required: true
    },
    loginVisible: {
      type: Boolean,
      required: true
    },
  }
}
</script>

<style lang="scss" scoped>
.notFoundPageText {
  text-align: center;
  margin-bottom: 80px;
  font-size: 1.5rem;
}
.image {
  width: 50%;
  margin: auto;
  margin-top: 150px;
  margin-bottom: 80px;
}
.notFoundPage {
  margin: auto;
}
</style>
