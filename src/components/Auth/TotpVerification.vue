<template>
  <div class="rounded-lg bg-white p-6 shadow-sm">
    <div class="text-xl font-bold text-black/30">
      {{ $t("admin.totp.verification") }}
    </div>

    <div class="mt-4">
      <div class="text-sm">
        {{ $t("admin.totp.verificationMessage") }}
      </div>

      <!-- Verification Code Input -->
      <div class="mt-4">
        <div class="text-sm font-bold">
          {{ $t("admin.totp.enterCode") }}
        </div>
        <div class="mt-1">
          <input
            v-model="verificationCode"
            type="text"
            inputmode="numeric"
            pattern="\d*"
            :placeholder="$t('admin.totp.codePlaceholder')"
            maxlength="6"
            class="w-full rounded border px-3 py-2"
            :class="error ? 'border-red-500' : 'border-gray-300'"
            @keyup.enter="verifyCode"
          />
          <div v-if="error" class="mt-2 text-sm text-red-600">
            {{ $t(error) }}
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-4 text-center">
        <t-button @click="handleCancel" :isCancel="true" class="mr-4 h-12 w-32">
          {{ $t("button.cancel") }}
        </t-button>
        <t-button @click="verifyCode" class="h-12 w-32 font-bold text-white">
          {{ $t("button.verify") }}
        </t-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import { TotpMultiFactorGenerator, MultiFactorResolver } from "firebase/auth";
import { useGeneralStore } from "@/store";

export default defineComponent({
  name: "TotpVerification",
  props: {
    resolver: {
      type: Object as PropType<MultiFactorResolver>,
      required: true,
    },
  },
  emits: ["complete", "cancel"],
  setup(props, { emit }) {
    const generalStore = useGeneralStore();
    const verificationCode = ref("");
    const error = ref("");

    const verifyCode = async () => {
      if (!verificationCode.value || verificationCode.value.length !== 6) {
        error.value = "admin.totp.error.invalidCode";
        return;
      }

      generalStore.setLoading(true);
      error.value = "";

      try {
        // Find TOTP factor
        const totpFactorInfo = props.resolver.hints.find(
          (hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID,
        );

        if (!totpFactorInfo) {
          console.error(
            "TOTP factor not found in hints:",
            props.resolver.hints,
          );
          throw new Error("TOTP factor not found");
        }

        console.log(
          "Creating TOTP assertion with factorId:",
          totpFactorInfo.uid,
        );

        // Create TOTP assertion for sign-in
        const multiFactorAssertion =
          TotpMultiFactorGenerator.assertionForSignIn(
            totpFactorInfo.uid,
            verificationCode.value,
          );

        console.log("Resolving sign-in with TOTP assertion");

        // Complete sign-in with multi-factor
        await props.resolver.resolveSignIn(multiFactorAssertion);

        console.log("TOTP verification successful");
        emit("complete");
      } catch (e: unknown) {
        console.error("Failed to verify TOTP:", e);
        console.error("Error code:", e.code);
        console.error("Error message:", e.message);

        if (e.code === "auth/invalid-verification-code") {
          error.value = "admin.totp.error.invalidCode";
        } else {
          error.value = "admin.totp.error.verificationFailed";
        }
      } finally {
        generalStore.setLoading(false);
      }
    };

    const handleCancel = () => {
      emit("cancel");
    };

    return {
      verificationCode,
      error,
      verifyCode,
      handleCancel,
    };
  },
});
</script>
