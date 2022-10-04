<template>
  <div
    class="mx-6 mt-6 rounded-lg bg-red-700 bg-opacity-10 p-4"
    
    >
    <div class="text-center mb-2 text-red-700">
      {{ $t("admin.needEmailVerification") }}
    </div>
    <div class="text-center mb-2">
      <b-button @click="send" class="b-reset-tw" disable="sent">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4 font-bold text-red-600"
          >
          {{ $t("admin.sendVerificationCode") }}
        </div>
      </b-button>
    </div>
    <div class="text-center text-red-700" v-if="sent">
      {{ $t("admin.verificationCodeSent") }}
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from "@vue/composition-api";
import { auth } from "@/lib/firebase/firebase9";
import { sendEmailVerification } from "firebase/auth";
import {
  useUser,
} from "@/utils/utils";

export default defineComponent({
  setup(_, ctx) {
    const user = useUser(ctx);
    
    const sent = ref(false);
    const send = async () => {
      console.log(auth.currentUser)
      const res = await sendEmailVerification(auth.currentUser);
      console.log(res);
      sent.value = true;
    };
    return {
      sent,
      send,
    };
  },
});
</script>
