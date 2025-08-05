<template>
  <div class="mx-6 mt-2 lg:mx-auto lg:max-w-2xl">
    <div class="mt-4 rounded-lg bg-white p-6 shadow-sm">
      <form @submit.prevent="onSignup">
        <!-- Title -->
        <div v-if="partner">
          <img :src="`/partners/${partner.logo}`" class="w-12" />
          <span class="font-bold">
            {{ partner.name }}
          </span>
          <hr />
        </div>
        <div class="text-xl font-bold text-black/30">
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
              <input
                v-model="email"
                type="email"
                :placeholder="$t('admin.emailPlaceHolder')"
                maxlength="256"
                class="w-full rounded border border-gray-300 px-3 py-2"
                :class="errors.email ? 'border-red-500' : 'border-green-500'"
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
            <o-field variant="success">
              <input
                v-model="name"
                type="text"
                :placeholder="$t('admin.enterName')"
                maxlength="100"
                class="w-full rounded border border-gray-300 px-3 py-2"
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
              <input
                v-model="password"
                type="password"
                :placeholder="$t('admin.passwordPlaceHolder')"
                maxlength="30"
                class="w-full rounded border border-gray-300 px-3 py-2"
                :class="errors.password ? 'border-red-500' : 'border-green-500'"
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
              <input
                v-model="confirmPassword"
                type="password"
                :placeholder="$t('admin.confirmPasswordPlaceHolder')"
                maxlength="30"
                class="w-full rounded border border-gray-300 px-3 py-2"
                :class="errors.confirm ? 'border-red-500' : 'border-green-500'"
              />
            </o-field>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-2 text-center">
          <t-button
            @click="handleCancel"
            :isCancel="true"
            class="mr-4 mb-2 h-12 w-32"
          >
            {{ $t("button.cancel") }}
          </t-button>

          <t-button
            :isDisabled="submitted && Object.keys(errors).length > 0"
            @click="onSignup"
            class="h-12 w-32 font-bold text-white"
          >
            {{ $t("button.next") }}
          </t-button>
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
            <i class="material-icons text-op-teal mr-2 text-lg">store</i>
            <div class="text-op-teal text-sm font-bold">
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

    useHead(() => ({
      title: [defaultTitle, "Signup"].join(" / "),
    }));

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
        try {
          await sendEmailVerification(result.user);
        } catch (e) {
          console.log(e);
        }
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
