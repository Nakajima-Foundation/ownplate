<template>
  <div class="mx-6 mt-4 lg:mx-auto lg:max-w-2xl">
    <div class="mt-4 rounded-lg bg-white p-6 shadow">
      <template v-if="isExpired === null"> </template>
      <template v-else-if="isExpired">
        <div class="mt-4 text-center">
          <div>
            {{ $t("admin.mailIsExpired") }}
          </div>
          <router-link to="/admin/user/reset">
            <div
              class="inline-flex h-16 items-center justify-center rounded-full border-2 border-op-teal px-6"
            >
              <i class="material-icons mr-2 text-2xl text-op-teal">store</i>
              <div class="text-lg font-bold text-op-teal">
                {{ $t("admin.reSend") }}
              </div>
            </div>
          </router-link>
        </div>
      </template>
      <template v-else-if="isSuccess">
        <p>{{ $t("admin.passwordUpdated") }}</p>
        <div class="mt-4 text-center">
          <router-link to="/admin/user/signin">
            <div
              class="inline-flex h-16 items-center justify-center rounded-full border-2 border-op-teal px-6"
            >
              <i class="material-icons mr-2 text-2xl text-op-teal">store</i>
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
            <o-field
              :variant="errors.password ? 'danger' : 'success'"
              :message="errors.password && $t(errors.password[0])"
            >
              <o-input
                v-model="password"
                type="password"
                :placeholder="$t('admin.passwordPlaceHolder')"
                maxlength="30"
                password-reveal
              />
            </o-field>
          </div>

          <!-- Confirm Password -->
          <div>
            <div class="text-sm font-bold">
              {{ $t("admin.confirmPassword") }}
            </div>

            <div class="mt-1">
              <o-field
                :variant="errors.confirm ? 'danger' : 'success'"
                :message="errors.confirm && $t(errors.confirm[0])"
              >
                <o-input
                  v-model="confirmPassword"
                  type="password"
                  :placeholder="$t('admin.confirmPasswordPlaceHolder')"
                  maxlength="30"
                  password-reveal
                />
              </o-field>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="mt-2 text-center">
            <o-button
              :disabled="Object.keys(errors).length > 0 || submitting"
              @click="resetPassword"
              class="b-reset-tw"
            >
              <div
                class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-op-teal shadow"
              >
                <div class="text-base font-bold text-white">
                  {{ $t("button.next") }}
                </div>
              </div>
            </o-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from "vue";

import { auth } from "@/lib/firebase/firebase9";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

import { useRoute } from "vue-router";

export default defineComponent({
  name: "AccountAction",
  setup() {
    const route = useRoute();

    const code = route.query.oobCode as string;

    const submitting = ref(false);
    const password = ref("");
    const confirmPassword = ref("");
    const isSuccess = ref(false);
    const error = ref("");

    const isExpired = ref<null | boolean>(null);
    const submitted = ref(false);

    const errors = computed(() => {
      if (!submitted.value) {
        return {};
      }
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

    const hasError = computed(() => {
      return Object.keys(errors.value).length > 0;
    });
    const resetPassword = async () => {
      submitted.value = true;
      if (hasError.value) {
        return;
      }
      submitting.value = true;
      try {
        await confirmPasswordReset(auth, code, password.value);
        isSuccess.value = true;
      } catch (e: any) {
        error.value = e.code;
      }
      submitting.value = true;
    };

    (async () => {
      try {
        await verifyPasswordResetCode(auth, code);
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
