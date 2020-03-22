<template>
  <section class="section">
    <div class="card block">
      <div class="card-content">
        <h2 class="p-big bold">
          Sign in with email
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

        <div class="columns">
          <div class="column">
            <b-button
              style="margin-right:auto"
              type="is-info"
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
              type="is-info"
              class="counter-button"
              expanded
              rounded
              @click="onSignin()"
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
export default {
  name: "Signin",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    error() {
      return this.$store.getters.error;
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  watch: {
    user(value) {
      if (value != null && value !== undefined) {
        this.$router.push("/");
      }
    }
  },
  methods: {
    onSignin() {
      this.$store.dispatch("user/signUserIn", {
        email: this.email,
        password: this.password
      });
    },
    onDismissed() {
      this.$store.dispatch("clearError");
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
