<template>
  <div class="mx-6 mt-6 lg:max-w-2xl lg:mx-auto">
    <div class="bg-white rounded-lg shadow mt-6 p-6">
      <form @submit.prevent="handleNext">
        <!-- Title -->
        <div class="text-xl font-bold text-black text-opacity-30">
          {{ $t("admin.passwordReset") }}
        </div>

        <!-- Email -->
        <div class="mt-4">
          <div class="text-sm font-bold">
            {{ $t("admin.email") }}
          </div>

          <div class="mt-1">
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
        </div>

        <!-- Submit Button -->
        <div class="mt-2 text-center">
          <b-button @click="handleCancel" class="b-reset-tw mr-4 mb-2">
            <div
              class="inline-flex justify-center items-center h-12 w-32 rounded-full bg-black bg-opacity-5"
            >
              <div class="text-base font-bold text-black text-opacity-60">
                {{ $t("button.cancel") }}
              </div>
            </div>
          </b-button>

          <b-button
            :disabled="Object.keys(errors).length > 0"
            @click="handleNext"
            class="b-reset-tw"
          >
            <div
              class="inline-flex justify-center items-center h-12 w-32 rounded-full bg-op-teal shadow"
            >
              <div class="text-base font-bold text-white">
                {{ $t("button.next") }}
              </div>
            </div>
          </b-button>
        </div>

        <!-- Email Sent -->
        <div
          v-if="emailSent"
          class="mt-4 text-center text-base font-bold text-blue-500"
        >
          {{ $t("admin.pleaseCheckInbox") }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import isEmail from "validator/lib/isEmail";
import { auth } from "~/plugins/firebase";

export default {
  name: "Reset",
  metaInfo() {
    return {
      title: [this.defaultTitle, "Reset Password"].join(" / "),
    };
  },
  data() {
    return {
      email: "",
      badEmail: "---invalid---",
      apiError: null,
      emailSent: false,
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
    },
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
        .catch((error) => {
          console.error("reset", error);
          if (error.code === "auth/user-not-found") {
            this.badEmail = this.email;
          } else {
            this.badEmail = "---Invalid---";
            this.apiError = error.code;
          }
        });
    },
  },
};
</script>
