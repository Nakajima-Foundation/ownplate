<template>
  <section class="section">
    <div class="text-xl font-bold text-black text-opacity-30 text-center">
      {{ $t("errorPage.requireLogin.message1") }}
    </div>

    <div>
      <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
        <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </b-modal>
    </div>
  </section>
</template>
<script>
import PhoneLogin from "~/app/auth/PhoneLogin";
export default {
  components: {
    PhoneLogin
  },
  props: {
    loginVisible: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    handleDismissed(params) {
      this.$emit("dismissed", params);
    }
  }
};
</script>
