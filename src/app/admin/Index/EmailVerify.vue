<template>
  <div class="mx-6 mt-6 rounded-lg bg-red-700 bg-opacity-10 p-6">
    <div class="mb-3 text-center text-lg font-bold text-red-700">
      {{ $t("admin.needEmailVerification") }}
    </div>
    <ul
      class="container mx-auto mb-4 list-outside list-disc pl-4 text-sm text-red-700 sm:w-4/5 2xl:w-3/4"
    >
      <li>
        {{ $t("admin.noteEmailVerification1", { email: fromEmail }) }}
      </li>
      <li>
        {{ $t("admin.noteEmailVerification2") }}
      </li>
    </ul>
    <div class="text-center">
      <o-button @click="send" class="b-reset-tw" :disabled="sent || isLoading">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full border border-red-700 bg-white px-6 font-bold text-red-700"
        >
          {{ $t("admin.sendVerificationCode") }}
        </div>
      </o-button>
    </div>
    <div class="mt-3 text-center text-sm font-bold text-red-700" v-if="sent">
      {{ $t("admin.verificationCodeSent") }}
    </div>
    <div class="mt-3 text-center text-sm font-bold text-red-700" v-if="isError">
      {{ $t("admin.verificationCodeError") }}
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from "@vue/composition-api";
import { auth } from "@/lib/firebase/firebase9";
import { sendEmailVerification } from "firebase/auth";
import { useUser } from "@/utils/utils";
import { fromEmail } from "@/config/project";

export default defineComponent({
  setup(_, ctx) {
    const user = useUser(ctx);

    const sent = ref(false);
    const isError = ref(false);
    const isLoading = ref(false);

    const send = async () => {
      console.log(auth.currentUser);
      try {
        isLoading.value = true;
        isError.value = false;
        const res = await sendEmailVerification(auth.currentUser);
        console.log(res);
        sent.value = true;
      } catch (e) {
        isError.value = true;
      } finally {
        isLoading.value = false;
      }
    };
    return {
      sent,
      isError,
      isLoading,

      send,
      fromEmail,
    };
  },
});
</script>
