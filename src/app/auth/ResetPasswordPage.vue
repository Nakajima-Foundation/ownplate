<template>
  <div>
    <!-- Password Rest -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-half is-offset-one-quarter">
            <div class="m-l-24 m-r-24">
              <div class="bg-surface r-8 d-low m-t-24 p-l-24 p-r-24 p-t-24 p-b-24">
                <form @submit.prevent="handleNext">
                  <div class="t-h6 c-text-black-disabled">{{ $t('admin.passwordReset') }}</div>

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

                  <!-- Submit Button -->
                  <div class="m-t-8 align-center">
                    <b-button class="b-reset op-button-small tertiary m-r-16" @click="handleCancel">
                      <span class="c-text-black-medium">{{ $t('button.cancel') }}</span>
                    </b-button>
                    <b-button
                      class="b-reset op-button-small primary"
                      :disabled="Object.keys(errors).length > 0"
                      @click="handleNext"
                    >
                      <span class="c-onprimary">{{ $t('button.next') }}</span>
                    </b-button>
                  </div>

                  <!-- Email Sent -->
                  <div
                    v-if="emailSent"
                    class="align-center m-t-16 t-subtitle1 c-status-blue"
                  >{{$t('admin.pleaseCheckInbox')}}</div>
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
import isEmail from "validator/lib/isEmail";
import { auth } from "~/plugins/firebase.js";

export default {
  name: "Reset",
  data() {
    return {
      email: "",
      badEmail: "---invalid---",
      apiError: null,
      emailSent: false
    };
  },
  computed: {
    errors() {
      let errors = {};
      if (!isEmail(this.email)) {
        errors.email = ["admin.error.email.invalid"];
      } else if (this.email === this.badEmail) {
        errors.email = ["admin.error.code.auth/user-not-found"];
      } else if (this.apiError) {
        errors.email = ["admin.error.code." + this.apiError];
      }
      return errors;
    }
  },
  methods: {
    handleCancel() {
      this.$router.push("/admin/user/signin");
    },
    async handleNext() {
      const options = { url: window.location.href.replace(/reset$/, "signin") };
      console.log("handleNext", options.url);
      auth
        .sendPasswordResetEmail(this.email, options)
        .then(() => {
          console.log("success");
          this.emailSent = true;
        })
        .catch(error => {
          console.error("reset", error);
          if (error.code === "auth/user-not-found") {
            this.badEmail = this.email;
          } else {
            this.badEmail = "---Invalid---";
            this.apiError = error.code;
          }
        });
    }
  }
};
</script>
