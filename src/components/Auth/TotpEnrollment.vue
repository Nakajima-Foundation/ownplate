<template>
  <div class="rounded-lg bg-white p-6 shadow-sm">
    <div class="text-xl font-bold text-black/30">
      {{ $t("admin.totp.setup") }}
    </div>

    <div v-if="!enrollmentComplete" class="mt-4">
      <!-- Warning for new signups without email verification -->
      <div
        v-if="!qrCodeDataUrl"
        class="mb-4 rounded-lg bg-yellow-50 p-4 text-sm"
      >
        <div class="flex items-start">
          <i class="material-icons mr-2 text-yellow-600">info</i>
          <div class="text-gray-700">
            <div class="mb-2 font-bold">
              {{ $t("admin.totp.signupWarning.title") }}
            </div>
            <div class="mb-2">{{ $t("admin.totp.signupWarning.message") }}</div>
          </div>
        </div>
      </div>

      <!-- QR Code Display -->
      <div v-if="qrCodeDataUrl" class="text-center">
        <div class="mb-2 text-sm font-bold">
          {{ $t("admin.totp.scanQrCode") }}
        </div>
        <img :src="qrCodeDataUrl" alt="QR Code" class="mx-auto max-w-xs" />

        <div class="mt-4 text-sm">
          <div class="font-bold">{{ $t("admin.totp.orEnterManually") }}</div>
          <code class="rounded bg-gray-100 px-2 py-1">{{ secret }}</code>
        </div>
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
            :placeholder="$t('admin.totp.codePlaceholder')"
            maxlength="6"
            class="w-full rounded border px-3 py-2"
            :class="error ? 'border-red-500' : 'border-gray-300'"
          />
          <div v-if="error" class="mt-2 text-sm text-red-600">
            {{ $t(error) }}
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-4 text-center">
        <t-button @click="handleSkip" :isCancel="true" class="mr-4 h-12 w-32">
          {{ $t("button.skip") }}
        </t-button>
        <t-button
          @click="verifyAndEnroll"
          class="h-12 w-32 font-bold text-white"
        >
          {{ $t("button.verify") }}
        </t-button>
      </div>
    </div>

    <div v-else class="mt-4 text-center">
      <i class="material-icons text-6xl text-green-600">check_circle</i>
      <div class="mt-2 text-lg font-bold">
        {{ $t("admin.totp.enrollmentComplete") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { auth } from "@/lib/firebase/firebase9";
import {
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
} from "firebase/auth";
import { useGeneralStore } from "@/store";
import QRCode from "qrcode";

export default defineComponent({
  name: "TotpEnrollment",
  emits: ["complete", "skip", "needsReauth"],
  setup(_props, { emit }) {
    const generalStore = useGeneralStore();
    const qrCodeDataUrl = ref("");
    const secret = ref("");
    const verificationCode = ref("");
    const error = ref("");
    const enrollmentComplete = ref(false);
    const totpSecret = ref<TotpSecret | null>(null);

    onMounted(async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("No user signed in");
        }

        // Get multi-factor session (per Firebase documentation)
        const multiFactorSession = await multiFactor(user).getSession();

        // Generate TOTP secret using the session
        totpSecret.value =
          await TotpMultiFactorGenerator.generateSecret(multiFactorSession);

        // Generate QR code URL (otpauth:// URI)
        const qrCodeUrl = totpSecret.value.generateQrCodeUrl(
          user.email || "user@example.com",
          "おもちかえり.com",
        );

        // Convert URI to QR code image (Data URL)
        qrCodeDataUrl.value = await QRCode.toDataURL(qrCodeUrl);

        secret.value = totpSecret.value.secretKey;
      } catch (e: any) {
        console.error("Failed to generate TOTP secret:", e);

        // Check if reauthentication is required
        if (e.code === "auth/requires-recent-login") {
          console.log("Reauthentication required for TOTP enrollment");
          emit("needsReauth");
          return;
        }

        error.value = "admin.totp.error.generateFailed";
      }
    });

    const verifyAndEnroll = async () => {
      if (!verificationCode.value || verificationCode.value.length !== 6) {
        error.value = "admin.totp.error.invalidCode";
        return;
      }

      generalStore.setLoading(true);
      error.value = "";

      try {
        const user = auth.currentUser;
        if (!user || !totpSecret.value) {
          throw new Error("No user or secret available");
        }

        // Create TOTP assertion
        const multiFactorAssertion =
          TotpMultiFactorGenerator.assertionForEnrollment(
            totpSecret.value,
            verificationCode.value,
          );

        // Enroll the factor
        await multiFactor(user).enroll(multiFactorAssertion, "TOTP");

        enrollmentComplete.value = true;
        setTimeout(() => {
          emit("complete");
        }, 2000);
      } catch (e: any) {
        console.error("Failed to enroll TOTP:", e);
        error.value = "admin.totp.error.enrollmentFailed";
      } finally {
        generalStore.setLoading(false);
      }
    };

    const handleSkip = () => {
      emit("skip");
    };

    return {
      qrCodeDataUrl,
      secret,
      verificationCode,
      error,
      enrollmentComplete,
      verifyAndEnroll,
      handleSkip,
    };
  },
});
</script>
