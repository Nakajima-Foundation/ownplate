<template>
  <section class="mx-auto max-w-full px-6 pb-12 pt-4">
    <div class="text-center text-xl font-bold text-black text-opacity-30">
      {{ $t("errorPage.requireLogin.message1") }}
    </div>

    <div>
      <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
        <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </b-modal>
    </div>
  </section>
</template>
<script>
import PhoneLogin from "@/app/auth/PhoneLogin";
export default {
  components: {
    PhoneLogin,
  },
  props: {
    loginVisible: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    handleDismissed(params) {
      this.$emit("dismissed", params);
    },
  },
};
</script>
