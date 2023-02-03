<template>
  <div class="mx-6 mt-6 lg:mx-auto lg:max-w-2xl">
    <div class="mt-6 rounded-lg bg-white p-6 shadow">
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
            <o-field
              :variant="errors.email ? 'danger' : 'success'"
              :message="errors.email && $t(errors.email[0])"
            >
              <o-input
                v-model="email"
                :placeholder="$t('admin.emailPlaceHolder')"
                maxlength="256"
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
            :disabled="Object.keys(errors).length > 0"
            @click="handleNext"
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

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
} from "vue";
import isEmail from "validator/lib/isEmail";
import { auth } from "@/lib/firebase/firebase9";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Reset",
  metaInfo() {
    return {
      title: [this.defaultTitle, "Reset Password"].join(" / "),
    };
  },
  setup() {
    const router = useRouter();

    const email = ref("");
    const badEmail = "---invalid---";
    const apiError = ref(null);
    const emailSent = ref(false);
    const submitted = ref(false);
    
    const errors = computed(() => {
      if (!submitted.value) {
        return {};
      }
      let err: any = {};
      if (!isEmail(email.value)) {
        err.email = ["admin.error.email.invalid"];
      } else if (email.value === badEmail) {
        err.email = ["admin.error.code.auth/user-not-found"];
      } else if (apiError.value) {
        err.email = ["admin.error.code." + apiError.value];
      }
      return err;
    });

    const handleCancel = () => {
      router.push("/admin/user/signin");
    };
    const handleNext = async () => {
      submitted.value = true;
      if (Object.keys(errors.value).length > 0) {
        return;
      }
      const options = { url: window.location.href.replace(/reset$/, "signin") };
      console.log("handleNext", options.url);
      sendPasswordResetEmail(auth, email.value, options)
        .then(() => {
          console.log("success");
          emailSent.value = true;
        })
        .catch((error) => {
          console.error("reset", error);
          if (error.code === "auth/user-not-found") {
            badEmail = email.value;
          } else {
            badEmail = "---Invalid---";
            apiError.value = error.code;
          }
        });
    };
    return {
      handleNext,
      handleCancel,
      errors,
      
      email,
      emailSent,
    };
  },
});
</script>
