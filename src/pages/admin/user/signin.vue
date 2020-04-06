<template>
  <section class="section">
    <div class="card block">
      <div class="card-content">
        <h2 class="p-big bold">
          {{ $t('admin.pleaseSignIn') }}
        </h2>

        <b-field
          :label="$t('admin.email')">
          <b-input
            v-model="email"
            type="email"
            :placeholder="$t('admin.emailPlaceHolder')"
            maxlength="256" />
        </b-field>

        <b-field
          :label="$t('admin.password')">
          <b-input
            v-model="password"
            type="password"
            :placeholder="$t('admin.passwordPlaceHolder')"
            maxlength="30"
            password-reveal />
        </b-field>
        <b-button>
          {{ $t('button.cancel') }}
        </b-button>
        <b-button
          type="is-primary"
          @click="onSignin()">
          {{ $t('button.next') }}
        </b-button>
      </div>
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
      password: ""
    };
  },
  methods: {
    async onSignin() {
      try {
        await auth.signInWithEmailAndPassword(this.email, this.password)
        console.log("onSignin success")
        this.$router.push("/");
      } catch(error) {
        console.log("onSignin failed", error.message);
      }
    },
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
