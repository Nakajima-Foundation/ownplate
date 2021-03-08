<template>
  <div class="mx-6 mt-6 lg:max-w-2xl lg:mx-auto">
    <div class="bg-white rounded-lg shadow mt-6 p-6">
      <form @submit.prevent="onSignup">
        <!-- Title -->
        <div class="text-xl font-bold text-black text-opacity-30">
          {{ $t("admin.registration") }}
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
                type="email"
                :placeholder="$t('admin.emailPlaceHolder')"
                maxlength="256"
              />
            </b-field>
          </div>
        </div>

        <!-- Name -->
        <div>
          <div class="text-sm font-bold">
            {{ $t("admin.name") }}
          </div>

          <div class="mt-1">
            <b-field>
              <b-input
                v-model="name"
                type="text"
                :placeholder="$t('admin.enterName')"
                maxlength="100"
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

        <!-- Confirm Password -->
        <div>
          <div class="text-sm font-bold">
            {{ $t("admin.confirmPassword") }}
          </div>

          <div class="mt-1">
            <b-field
              :type="errors.confirm ? 'is-danger' : 'is-success'"
              :message="errors.confirm && $t(errors.confirm[0])"
            >
              <b-input
                v-model="confirmPassword"
                type="password"
                :placeholder="$t('admin.confirmPasswordPlaceHolder')"
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

          <b-button
            :disabled="Object.keys(errors).length > 0"
            @click="onSignup"
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

        <!-- Terms of Use & Privacy Policy -->
        <div class="mt-6 text-xs">
          <div v-if="!isLocaleJapan">
            <span>By submitting this form, you agree to the</span>
            <router-link to="/terms/admin" target="_blank">
              <span class="text-op-teal">Terms of Service</span>
            </router-link>
            <span>and</span>
            <router-link to="/privacy" target="_blank">
              <span class="text-op-teal">Privacy Policy</span>
            </router-link>
            <span>.</span>
          </div>

          <div v-else>
            <span>送信することで、</span>
            <router-link to="/terms/admin" target="_blank">
              <span class="text-op-teal">利用規約</span>
            </router-link>
            <span>と</span>
            <router-link to="/privacy" target="_blank">
              <span class="text-op-teal">プライバシーポリシー</span>
            </router-link>
            <span>に同意したものとみなされます。</span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import isEmail from "validator/lib/isEmail";
import { db, auth, firestore } from "~/plugins/firebase.js";

export default {
  name: "Signup",
  data() {
    return {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      deferredPush: false,
      emailTaken: "---invalid---"
    };
  },
  computed: {
    errors() {
      let errors = {};
      if (this.password !== this.confirmPassword) {
        errors.confirm = ["admin.error.password.mismatch"];
      }
      if (this.password.length < 6) {
        errors.password = ["admin.error.password.tooshort"];
      }
      if (!isEmail(this.email)) {
        errors.email = ["admin.error.email.invalid"];
      } else if (this.email === this.emailTaken) {
        errors.email = ["admin.error.email.taken"];
      }
      return errors;
    }
  },
  watch: {
    user(newValue) {
      console.log("user updated", this.deferredPush);
      if (this.deferredPush && newValue) {
        this.$router.push("/admin/restaurants");
      }
    }
  },
  methods: {
    handleCancel() {
      this.$router.push("/");
    },
    async onSignup() {
      const email = this.email; //
      try {
        let result = await auth.createUserWithEmailAndPassword(
          this.email,
          this.password
        );
        console.log("signup success", result.user.uid, this.name);
        await db.doc(`admins/${result.user.uid}`).set({
          name: this.name,
          created: firestore.FieldValue.serverTimestamp()
        });
        await db.doc(`admins/${result.user.uid}/private/profile`).set({
          email: result.user.email,
          updated: firestore.FieldValue.serverTimestamp()
        });
        if (this.user) {
          console.log("signup calling push");
          this.$router.push("/admin/restaurants");
        } else {
          console.log("signup deferred push");
          this.deferredPush = true;
        }
      } catch (error) {
        console.warn("onSignup failed", error.code, error.message);
        if (error.code === "auth/email-already-in-use") {
          this.emailTaken = email;
        } else {
          // BUGBUG: Not processing other type of errors
        }
      }
    }
  }
};
</script>
