<template>
  <div>
    <!-- Sign Up -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gaplress">
          <div class="column is-half is-offset-one-quarter">
            <div class="m-l-24 m-r-24">
              <div class="bg-surface r-8 d-low m-t-24 p-l-24 p-r-24 p-t-24 p-b-24">
                <form @submit.prevent="onSignup">
                  <div class="t-h6 c-text-black-disabled">{{ $t('admin.registration') }}</div>

                  <!-- Email -->
                  <div class="m-t-16">
                    <div class="t-subtitle2 c-text-black-medium m-b-4">{{ $t('admin.email') }}</div>
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

                  <!-- Name -->
                  <div>
                    <div class="t-subtitle2 c-text-black-medium m-b-4">{{ $t('admin.name') }}</div>
                    <b-field>
                      <b-input
                        v-model="name"
                        type="text"
                        :placeholder="$t('admin.enterName')"
                        maxlength="100"
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

                  <!-- Confirm Password -->
                  <div>
                    <div
                      class="t-subtitle2 c-text-black-medium m-b-4"
                    >{{ $t('admin.confirmPassword') }}</div>

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

                  <!-- Submit Button -->
                  <div class="m-t-8 align-center">
                    <b-button class="b-reset op-button-small tertiary m-r-16" @click="handleCancel">
                      <span class="c-text-black-medium">{{ $t('button.cancel') }}</span>
                    </b-button>
                    <b-button
                      class="b-reset op-button-small primary"
                      :disabled="Object.keys(errors).length > 0"
                      @click="onSignup"
                    >
                      <span class="c-onprimary">{{ $t('button.next') }}</span>
                    </b-button>
                  </div>

                  <!-- Terms of Use & Privacy Policy -->
                  <div v-if="!isLocaleJapan" class="m-t-24 t-caption">
                    <span>By submitting this form, you agree to the</span>
                    <router-link to="/terms/admin" target="_blank">
                      <span class="c-primary">Terms of Service</span>
                    </router-link>
                    <span>and</span>
                    <router-link to="/privacy" target="_blank">
                      <span class="c-primary">Privacy Policy</span>
                    </router-link>
                    <span>.</span>
                  </div>
                  <div v-else class="m-t-24 t-caption">
                    <span>送信することで、</span>
                    <router-link to="/terms/admin" target="_blank">
                      <span class="c-primary">利用規約</span>
                    </router-link>
                    <span>と</span>
                    <router-link to="/privacy" target="_blank">
                      <span class="c-primary">プライバシーポリシー</span>
                    </router-link>
                    <span>に同意したものとみなされます。</span>
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
