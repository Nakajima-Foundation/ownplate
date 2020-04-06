<template>
  <section class="section">
    <div class="card block">
      <form class="card-content"
        @submit.prevent="onSignup">
        <h2 class="p-big bold">
          {{ $t('admin.registration') }}
        </h2>
        <b-field
          :label="$t('admin.email')">
          <b-input
            v-model="email"
            type="email"
            placeholder="Enter email here"
            maxlength="256" />
        </b-field>

        <b-field
          :label="$t('admin.name')">
          <b-input
            v-model="name"
            type="text"
            placeholder="Enter name here"
            maxlength="100" />
        </b-field>

        <b-field
          :label="$t('admin.password')">
          <b-input
            v-model="password"
            type="password"
            placeholder="Enter password here"
            maxlength="30"
            password-reveal />
        </b-field>

        <b-field
          :label="$t('admin.confirmPassword')">
          <b-input
            v-model="confirmPassword"
            type="password"
            placeholder="Enter confirm password here"
            maxlength="30"
            password-reveal
            :rules="[comparePasswords]" />
        </b-field>

        <b-button>
          {{ $t('button.cancel') }}
        </b-button>
        <b-button
          type="is-primary"
          @click="onSignup"
        >
          {{ $t('button.next') }}
        </b-button>
      </form>
    </div>
  </section>
</template>

<script>
import { auth } from "~/plugins/firebase.js";

export default {
  name: "Signup",
  data() {
    return {
      email: "",
      name: "",
      password: "",
      confirmPassword: ""
    };
  },
  computed: {
    comparePasswords() {
      return this.password !== this.confirmPassword
        ? "Password do not match"
        : "";
    },
  },
  methods: {
    async onSignup() {
      try {
        await auth.createUserWithEmailAndPassword(this.email, this.password)
        console.log("onSignup success")
        this.$router.push("/");
      } catch(error) {
        console.log("onSignup failed", error.message);
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
