<template>
  <section class="section">
    <div class="card block">
      <div class="card-content">
        <h2 class="p-big bold">
          Create account
        </h2>
        <div class="field is-horizontal">
          <div class="field-body">
            <h4>
              Email
            </h4>
          </div>
        </div>
        <b-field>
          <b-input
            v-model="email"
            type="email"
            placeholder="Enter email here"
            maxlength="256"
          ></b-input>
        </b-field>

        <div class="field is-horizontal">
          <div class="field-body">
            <h4>
              First & last name
            </h4>
          </div>
        </div>
        <b-field>
          <b-input
            v-model="name"
            type="text"
            placeholder="Enter name here"
            maxlength="100"
          ></b-input>
        </b-field>

        <div class="field is-horizontal">
          <div class="field-body">
            <h4>
              Password
            </h4>
          </div>
        </div>
        <b-field type="is-white">
          <b-input
            v-model="password"
            type="password"
            placeholder="Enter password here"
            maxlength="30"
            password-reveal
          ></b-input>
        </b-field>

        <div class="field is-horizontal">
          <div class="field-body">
            <h4>
              Confirm Password
            </h4>
          </div>
        </div>
        <b-field type="is-white">
          <b-input
            v-model="confirmPassword"
            type="password"
            placeholder="Enter confirm password here"
            maxlength="30"
            password-reveal
            :rules="[comparePasswords]"
          ></b-input>
        </b-field>

        <div class="columns">
          <div class="column">
            <b-button
              style="margin-right:auto"
              type="is-primary"
              class="counter-button"
              expanded
              rounded
            >
              Cancel
            </b-button>
          </div>
          <div class="column">
            <b-button
              style="margin-right:auto"
              type="is-primary"
              class="counter-button"
              expanded
              rounded
              @click="onSignup()"
            >
              Next
            </b-button>
          </div>
        </div>
      </div>
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
