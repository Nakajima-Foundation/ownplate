<template>
  <div class="mx-6 mt-6 lg:max-w-2xl lg:mx-auto">
    <!-- Note for the First User -->
    <div class="bg-green-600 bg-opacity-10 p-6 rounded-lg">
      <div class="flex">
        <div>
          <i class="material-icons text-4xl text-green-600 flex-shrink-0 mr-4"
            >info</i
          >
        </div>

        <div class="flex-1 text-base font-bold">
          {{ $t("admin.encourageToReadManual.before") }}
          <a
            href="https://docs.omochikaeri.com/manuals/manual.pdf"
            target="_blank"
          >
            {{ $t("admin.encourageToReadManual.manualName") }}
          </a>
          {{ $t("admin.encourageToReadManual.after") }}
        </div>
      </div>
    </div>

    <!-- Sign In Card -->
    <div class="bg-white rounded-lg shadow mt-6 p-6">
      <form @submit.prevent="onSignin">
        <div class="text-xl font-bold text-black text-opacity-30">
          {{ $t("admin.pleaseSignIn") }}
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

        <!-- Password -->
        <div>
          <div class="text-sm font-bold">
            {{ $t("admin.password") }}
          </div>

          <div class="mt-1">
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

          <b-button @click="onSignin" class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center h-12 w-32 rounded-full bg-op-teal shadow"
            >
              <div class="text-base font-bold text-white">
                {{ $t("button.next") }}
              </div>
            </div>
          </b-button>
        </div>

        <!-- Sign Up as a New User -->
        <div class="mt-6 text-center">
          <router-link to="/admin/user/signup">
            <div class="inline-flex justify-center items-center">
              <i class="material-icons text-lg text-op-teal mr-2"
                >person_add_alt_1</i
              >
              <div class="text-sm font-bold text-op-teal">
                {{ $t("admin.pleaseSignUp") }}
              </div>
            </div>
          </router-link>
        </div>

        <!-- Forgot Password -->
        <div class="mt-6 text-center">
          <router-link to="/admin/user/reset">
            <div class="inline-flex justify-center items-center">
              <i class="material-icons text-lg text-op-teal mr-2">help</i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.forgotPassword")
              }}</span>
            </div>
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { auth } from "@/lib/firebase/firebase9";
import { signInWithEmailAndPassword } from "firebase/auth";

export default {
  name: "Signin",
  metaInfo() {
    return {
      title: [this.defaultTitle, "Signin Admin"].join(" / "),
    };
  },
  data() {
    return {
      email: "",
      password: "",
      errors: {},
    };
  },
  created() {
    if (this.isAdmin) {
      this.redirectToAdminPage();
    }
  },
  watch: {
    user(newValue) {
      console.log("user changed");
      if (newValue) {
        this.redirectToAdminPage();
      }
    },
  },
  methods: {
    handleCancel() {
      this.$router.push("/");
    },
    async onSignin() {
      this.$store.commit("setLoading", true);
      this.errors = {};
      signInWithEmailAndPassword(auth, this.email, this.password)
        .then((ret) => {
          console.log("onSignin success");
          this.$store.commit("setLoading", false);
        })
        .catch((error) => {
          console.log("onSignin failed", error.code, error.message);
          const errorCode = "admin.error.code." + error.code;
          if (error.code === "auth/wrong-password") {
            this.errors = { password: [errorCode] };
          } else {
            this.errors = { email: [errorCode] };
          }
          this.$store.commit("setLoading", false);
        });
    },
  },
};
</script>
