<template>
  <div>
    <!-- Sign In -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-half is-offset-one-quarter">
            <div class="m-l-24 m-r-24">
              <div class="bg-surface r-8 d-low m-t-24 p-l-24 p-r-24 p-t-24 p-b-24">
                <form @submit.prevent="onSignin">
                  <div class="t-h6 c-text-black-disabled">{{ $t('admin.pleaseSignIn') }}</div>

                  <!-- Email -->
                  <div class="m-t-16">
                    <div class="t-subtitle2 c-text-black-medium m-b-4">{{ $t('admin.email') }}</div>
                    <b-field
                      :type="errors.email ? 'is-danger' : 'is-success'"
                      :message="errors.email && $t(errors.email[0])"
                    >
                      <b-input
                        v-model="email"
                        :placeholder="$t('admin.emailPlaceHolder')"
                        maxlength="256"
                      />
                    </b-field>
                  </div>

                  <!-- Password -->
                  <div>
                    <div class="t-subtitle2 c-text-black-medium m-b-4">{{ $t('admin.password') }}</div>
                    <b-field
                      :type="errors.password ? 'is-danger' : 'is-success'"
                      :message="errors.password && $t(errors.password[0])"
                    >
                      <b-input
                        v-model="password"
                        type="password"
                        :placeholder="$t('admin.passwordPlaceHolder')"
                        maxlength="30"
                        password-reveal
                      />
                    </b-field>
                  </div>

                  <!-- Submit Button -->
                  <div class="m-t-8 align-center">
                    <b-button class="b-reset op-button-small tertiary m-r-16" @click="handleCancel">
                      <span class="c-text-black-medium">{{ $t('button.cancel') }}</span>
                    </b-button>
                    <b-button class="b-reset op-button-small primary" @click="onSignin">
                      <span class="c-onprimary">{{ $t('button.next') }}</span>
                    </b-button>
                  </div>

                  <!-- Sign Up as a New User -->
                  <div class="align-center m-t-24">
                    <router-link to="/admin/user/signup">
                      <div class="op-button-text">
                        <i class="material-icons c-primary">person_add_alt_1</i>
                        <span class="c-primary t-button">{{$t('admin.pleaseSignUp')}}</span>
                      </div>
                    </router-link>
                  </div>

                  <!-- Forgot Password -->
                  <div class="align-center m-t-8">
                    <router-link to="/admin/user/reset">
                      <div class="op-button-text">
                        <i class="material-icons c-primary">help</i>
                        <span class="c-primary t-button">{{$t('admin.forgotPassword')}}</span>
                      </div>
                    </router-link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
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
  watch: {
    user(newValue) {
      console.log("user changed", newValue);
      if (newValue) {
        this.$router.push("/admin/restaurants");
      }
    }
  },
  methods: {
    handleCancel() {
      this.$router.push("/");
    },
    async onSignin() {
      this.$store.commit("setLoading", true);
      this.errors = {};
      auth
        .signInWithEmailAndPassword(this.email, this.password)
        .then(ret => {
          console.log("onSignin success");
          this.$store.commit("setLoading", false);
        })
        .catch(error => {
          console.log("onSignin failed", error.code, error.message);
          const errorCode = "admin.error.code." + error.code;
          if (error.code === "auth/wrong-password") {
            this.errors = { password: [errorCode] };
          } else {
            this.errors = { email: [errorCode] };
          }
          this.$store.commit("setLoading", false);
        });
    }
  }
};
</script>
