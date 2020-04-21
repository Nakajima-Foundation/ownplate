<template>
  <section class="section">
    <div class="card block">
      <form 
        class="card-content"
        @submit.prevent="onSignin">
        <h2 class="p-big bold">
          {{ $t('admin.pleaseSignIn') }}
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

        <b-field
          :type="errors.password ? 'is-danger' : 'is-success'"
          :message="errors.password && $t(errors.password[0])"
          :label="$t('admin.password')">
          <b-input
            v-model="password"
            type="password"
            :placeholder="$t('admin.passwordPlaceHolder')"
            maxlength="30"
            password-reveal />
        </b-field>
        <b-button
          @click="handleCancel">
          {{ $t('button.cancel') }}
        </b-button>
        <b-button
          type="is-primary"
          @click="onSignin">
          {{ $t('button.next') }}
        </b-button>
        <p style="margin-top: 2rem">
          <router-link to="/admin/user/signup">
            {{$t('admin.pleaseSignUp')}} 
          </router-link>
          <br/>
          <router-link to="/admin/user/reset">
            {{$t('admin.forgotPassword')}} 
          </router-link>
        </p>
        <p style="margin-top: 2rem">
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
      password: "",
      errors: {}
    };
  },
  methods: {
    handleCancel() {
       this.$router.push("/");
    },
    async onSignin() {
      try {
        this.errors = {};
        await auth.signInWithEmailAndPassword(this.email, this.password)
        console.log("onSignin success")
        this.$router.push("/admin/restaurants");
      } catch(error) {
        console.log("onSignin failed", error.code, error.message);
        const errorCode = "admin.error.code."+error.code;
        if (error.code === "auth/wrong-password") {
          this.errors = { "password":[errorCode] };
        } else {
          this.errors = { "email":[errorCode] };
        }
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
