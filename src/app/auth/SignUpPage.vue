<template>
  <div class="mx-6 mt-2 lg:mx-auto lg:max-w-2xl">
    <div class="mt-4 rounded-lg bg-white p-6 shadow">
      <form @submit.prevent="onSignup">
        <!-- Title -->
        <div v-if="partner">
          <img :src="`/partners/${partner.logo}`" class="w-12" />
          <span class="font-bold">
            {{ partner.name }}
          </span>
          <hr />
        </div>
        <div class="text-xl font-bold text-black text-opacity-30">
          {{ $t("admin.registration") }}
        </div>

        <!-- Email -->
        <div class="mt-4">
          <div class="text-sm font-bold">
            {{ $t("admin.email") }}
          </div>

          <div class="mt-1">
            <o-field
              :variant="errors.email ? 'danger' : 'success'"
              :message="errors.email && $t(errors.email[0])"
            >
              <o-input
                v-model="email"
                type="email"
                :placeholder="$t('admin.emailPlaceHolder')"
                maxlength="256"
                expanded
              />
            </o-field>
          </div>
        </div>

        <!-- Name -->
        <div>
          <div class="text-sm font-bold">
            {{ $t("admin.name") }}
          </div>

          <div class="mt-1">
            <o-field
              variant="success"
            >
              <o-input
                v-model="name"
                type="text"
                :placeholder="$t('admin.enterName')"
                maxlength="100"
                expanded
              />
            </o-field>
          </div>
        </div>

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
                expanded
              />
            </o-field>
          </div>
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
                expanded
              />
            </o-field>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-2 text-center">
          <o-button @click="handleCancel" class="b-reset-tw mr-4 mb-2">
            <div
              class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-black bg-opacity-5"
            >
              <div class="text-base font-bold text-black text-opacity-60">
                {{ $t("button.cancel") }}
              </div>
            </div>
          </o-button>

          <o-button
            :disabled="submitted && Object.keys(errors).length > 0"
            @click="onSignup"
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

        <!-- Terms of Use & Privacy Policy -->
        <div class="mt-2 text-xs">
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
      <!-- Sign Up as a New User -->
      <div class="mt-2 text-center">
        <router-link to="/admin/user/signin">
          <div class="inline-flex items-center justify-center">
            <i class="material-icons mr-2 text-lg text-op-teal">store</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.goToSignIn") }}
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { useStore } from "vuex";
import isEmail from "validator/lib/isEmail";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { partners } from "@/config/constant";

import { useIsLocaleJapan, useUserData, defaultTitle } from "@/utils/utils";
import { db, auth } from "@/lib/firebase/firebase9";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import { useRoute, useRouter } from "vue-router";
import { useHead } from "@unhead/vue";

export default defineComponent({
  name: "Signup",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const isLocaleJapan = useIsLocaleJapan();
    const { user } = useUserData();

    const email = ref("");
    const name = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const deferredPush = ref(false);
    const emailTaken = ref("---invalid---");
    const submitted = ref(false);

    useHead({
      title: [defaultTitle, "Signup"].join(" / "),
    });

    const partner = computed(() => {
      if (route.params.partner) {
        const match = partners.find((a) => {
          return a.id === route.params.partner;
        });
        if (match) {
          return match;
        }
      }
      return null;
    });
    const errors = computed(() => {
      if (!submitted.value) {
        return {};
      }
      const errs: { [key: string]: string[] } = {};
      if (password.value !== confirmPassword.value) {
        errs.confirm = ["admin.error.password.mismatch"];
      }
      if (password.value.length < 8) {
        errs.password = ["admin.error.password.tooshort"];
      }
      if (!/[0-9]/.test(password.value) || !/[a-zA-Z]/.test(password.value)) {
        errs.password = ["admin.error.password.invalid"];
      }
      if (!isEmail(email.value)) {
        errs.email = ["admin.error.email.invalid"];
      } else if (email.value === emailTaken.value) {
        errs.email = ["admin.error.email.taken"];
      }
      if (name.value.length === 0) {
        errs.name = ["admin.error.name.invalid"];
      }
      return errs;
    });
    const hasError = computed(() => {
      return Object.keys(errors.value).length > 0;
    });

    watch(user, (newValue) => {
      console.log("user updated", deferredPush.value);
      if (deferredPush.value && newValue) {
        router.push("/admin/restaurants");
      }
    });
    if (user.value) {
      router.push("/admin/restaurants");
    }

    const handleCancel = () => {
      router.push("/");
    };
    const onSignup = async () => {
      submitted.value = true;
      if (hasError.value) {
        return;
      }
      store.commit("setLoading", true);
      try {
        const result = await createUserWithEmailAndPassword(
          auth,
          email.value,
          password.value,
        );
        await sendEmailVerification(result.user);
        console.log("signup success", result.user.uid, name.value);
        if (partner.value) {
          await setDoc(doc(db, `admins/${result.user.uid}`), {
            name: name.value,
            created: serverTimestamp(),
            partners: [partner.value.id],
          });
        } else {
          await setDoc(doc(db, `admins/${result.user.uid}`), {
            name: name.value,
            created: serverTimestamp(),
          });
        }
        await setDoc(doc(db, `admins/${result.user.uid}/private/profile`), {
          email: result.user.email,
          updated: serverTimestamp(),
        });
        store.commit("setLoading", false);
        if (user) {
          console.log("signup calling push");
          router.push("/admin/restaurants");
        } else {
          console.log("signup deferred push");
          deferredPush.value = true;
        }
      } catch (error: any) {
        store.commit("setLoading", false);

        console.warn("onSignup failed", error.code, error.message);
        if (error.code === "auth/email-already-in-use") {
          emailTaken.value = email.value;
        } else {
          // BUGBUG: Not processing other type of errors
        }
      }
    };
    return {
      //
      email,
      name,
      password,
      confirmPassword,
      deferredPush,
      emailTaken,
      submitted,

      // computed
      partner,
      errors,
      hasError,
      // metho
      handleCancel,
      onSignup,

      isLocaleJapan,
    };
  },
});
</script>
