<template>
  <div class="mx-6 mt-6 lg:max-w-2xl lg:mx-auto">
    <div class="bg-white rounded-lg shadow mt-6 p-6">
      <template v-if="isExpired === null"> </template>
      <template v-else-if="isExpired">
        <div class="mt-6 text-center">
          <div>
            {{ $t("admin.mailIsExpired") }}
          </div>
          <router-link to="/admin/user/reset">
            <div
              class="inline-flex justify-center items-center h-16 px-6 rounded-full border-2 border-op-teal"
            >
              <i class="material-icons text-2xl text-op-teal mr-2">store</i>
              <div class="text-lg font-bold text-op-teal">
                {{ $t("admin.reSend") }}
              </div>
            </div>
          </router-link>
        </div>
      </template>
      <template v-else-if="isSuccess">
        <p>{{ $t("admin.passwordUpdated") }}</p>
        <div class="mt-6 text-center">
          <router-link to="/admin/user/signin">
            <div
              class="inline-flex justify-center items-center h-16 px-6 rounded-full border-2 border-op-teal"
            >
              <i class="material-icons text-2xl text-op-teal mr-2">store</i>
              <div class="text-lg font-bold text-op-teal">
                {{ $t("admin.goToSignIn") }}
              </div>
            </div>
          </router-link>
        </div>
      </template>
      <template v-else>
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
            <b-button
              :disabled="Object.keys(errors).length > 0 || submitting"
              @click="resetPassword"
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
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from "@vue/composition-api";

import { auth } from "@/lib/firebase/firebase9";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
export default defineComponent({
  name: "AccountAction",
  setup(_, ctx) {
    const code = ctx.root.$route.query.oobCode as string;

    const submitting = ref(false);
    const password = ref("");
    const confirmPassword = ref("");
    const isSuccess = ref(false);
    const error = ref("");

    const isExpired = ref<null | boolean>(null);

    const errors = computed(() => {
      const _errors: { [key: string]: string[] } = {};
      if (password.value !== confirmPassword.value) {
        _errors.confirm = ["admin.error.password.mismatch"];
      }
      if (password.value.length < 8) {
        _errors.password = ["admin.error.password.tooshort"];
      }
      if (!/[0-9]/.test(password.value) || !/[a-zA-Z]/.test(password.value)) {
        _errors.password = ["admin.error.password.invalid"];
      }
      if (error.value) {
        _errors.firebase = ["admin.error.code." + error.value];
      }
      return _errors;
    });

    const resetPassword = async () => {
      submitting.value = true;
      try {
        const res = await confirmPasswordReset(auth, code, password.value);
        isSuccess.value = true;
      } catch (e) {
        error.value = e.code;
      }
      submitting.value = true;
    };

    (async () => {
      try {
        const res = await verifyPasswordResetCode(auth, code);
        isExpired.value = false;
      } catch (e) {
        isExpired.value = true;
      }
    })();
    return {
      submitting,
      password,
      confirmPassword,
      isSuccess,
      errors,
      resetPassword,

      isExpired,
    };
  },
});
</script>