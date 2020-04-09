<template>
  <section class="section">
    <div class="card block">
      <form 
        class="card-content"
        @submit.prevent="onSignin">
        <h2 class="p-big bold">
          {{ $t('admin.passwordReset') }}
        </h2>

        <b-field
          :type="errors.email ? 'is-danger' : 'is-success'"
          :message="errors.email && $t(errors.email[0])"
          :label="$t('admin.email')">
          <b-input
            v-model="email"
            :placeholder="$t('admin.emailPlaceHolder')"
            maxlength="256" />
        </b-field>

        <b-button
          @click="handleCancel">
          {{ $t('button.cancel') }}
        </b-button>
        <b-button
          type="is-primary"
          @click="handleNext">
          {{ $t('button.next') }}
        </b-button>
        </p>
      </form>
    </div>
  </section>
</template>

<script>
import { auth } from "~/plugins/firebase.js";

export default {
  name: "Signin",
  data() {
    return {
      email: "",
      errors: {}
    };
  },
  methods: {
    handleCancel() {
       this.$router.push("/admin/user/signin");
    },
    async handleNext() {
      console.log("handleNext");
    },
  }
};
</script>
<style lang="scss" scoped>
</style>
