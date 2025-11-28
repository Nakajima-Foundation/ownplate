<template>
  <div class="mt-6">
    <!-- Title -->
    <div class="text-center">
      <div class="text-sm font-bold text-black/30">
        {{ $t("profile.totp.title") }}
      </div>
    </div>

    <!-- Current Status -->
    <div class="mt-2 text-center">
      <div class="text-base font-bold">
        {{ totpStatus }}
      </div>
    </div>

    <!-- Email Verification Required -->
    <div v-if="user && !user.emailVerified" class="mt-4 text-center">
      <div class="text-sm text-red-600">
        {{ $t("profile.totp.emailVerificationRequired") }}
      </div>
    </div>

    <!-- Enable/Disable TOTP -->
    <div v-else-if="user && user.email" class="mt-4 text-center">
      <!-- Not Enrolled - Show Enable Button -->
      <div v-if="!isTotpEnrolled">
        <button
          @click="startEnrollment"
          class="bg-op-teal inline-flex h-9 cursor-pointer items-center justify-center rounded-full px-4"
        >
          <div class="text-sm font-bold text-white">
            {{ $t("profile.totp.enable") }}
          </div>
        </button>
      </div>

      <!-- Enrolled - Show Disable Button -->
      <div v-else>
        <button
          @click="startUnenrollment"
          class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-red-600 px-4"
        >
          <div class="text-sm font-bold text-white">
            {{ $t("profile.totp.disable") }}
          </div>
        </button>
      </div>
    </div>

    <!-- Reauthentication Modal -->
    <ReauthenticateModal
      v-if="showReauthenticate"
      @success="handleReauthSuccess"
      @cancel="showReauthenticate = false"
    />

    <!-- Enrollment Modal -->
    <div
      v-if="showEnrollment"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="mx-4 w-full max-w-lg">
        <TotpEnrollment
          @complete="handleEnrollmentComplete"
          @skip="handleEnrollmentSkip"
          @needsReauth="handleEnrollmentNeedsReauth"
        />
      </div>
    </div>

    <!-- Unenrollment Confirmation Modal -->
    <div
      v-if="showUnenrollmentConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div class="text-xl font-bold text-black/30">
          {{ $t("profile.totp.disableConfirmTitle") }}
        </div>
        <div class="mt-4 text-sm">
          {{ $t("profile.totp.disableConfirmMessage") }}
        </div>
        <div class="mt-6 flex justify-center gap-4">
          <button
            @click="showUnenrollmentConfirm = false"
            class="inline-flex h-12 w-32 cursor-pointer items-center justify-center rounded-full bg-black/5"
          >
            <div class="text-base font-bold text-black/60">
              {{ $t("button.cancel") }}
            </div>
          </button>
          <button
            @click="disableTotp"
            class="inline-flex h-12 w-32 cursor-pointer items-center justify-center rounded-full bg-red-600"
          >
            <div class="text-base font-bold text-white">
              {{ $t("button.disable") }}
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { auth } from "@/lib/firebase/firebase9";
import { multiFactor } from "firebase/auth";
import { useI18n } from "vue-i18n";
import { useGeneralStore } from "@/store";
import TotpEnrollment from "@/components/Auth/TotpEnrollment.vue";
import ReauthenticateModal from "@/components/Auth/ReauthenticateModal.vue";

export default defineComponent({
  name: "TotpSettings",
  components: {
    TotpEnrollment,
    ReauthenticateModal,
  },
  setup() {
    const { t } = useI18n({ useScope: "global" });
    const generalStore = useGeneralStore();
    const user = computed(() => auth.currentUser);
    const isTotpEnrolled = ref(false);
    const showReauthenticate = ref(false);
    const showEnrollment = ref(false);
    const showUnenrollmentConfirm = ref(false);
    const pendingUnenroll = ref(false);

    const totpStatus = computed(() => {
      if (!user.value) {
        return t("profile.status.none");
      }
      return isTotpEnrolled.value
        ? t("profile.totp.status.enabled")
        : t("profile.totp.status.disabled");
    });

    const checkTotpEnrollment = () => {
      if (user.value) {
        const enrolledFactors = multiFactor(user.value).enrolledFactors;
        isTotpEnrolled.value = enrolledFactors.length > 0;
      }
    };

    onMounted(() => {
      checkTotpEnrollment();
    });

    const startEnrollment = () => {
      // Show enrollment modal directly (no reauthentication needed per Firebase docs)
      showEnrollment.value = true;
    };

    const disableTotp = async () => {
      if (!user.value) return;

      generalStore.setLoading(true);
      try {
        const enrolledFactors = multiFactor(user.value).enrolledFactors;
        if (enrolledFactors.length > 0) {
          await multiFactor(user.value).unenroll(enrolledFactors[0]);
          checkTotpEnrollment();
        }
        showUnenrollmentConfirm.value = false;
      } catch (e: any) {
        console.error("Failed to disable TOTP:", e);

        // Handle reauthentication required errors
        if (
          e.code === "auth/user-token-expired" ||
          e.code === "auth/requires-recent-login"
        ) {
          // User needs to re-authenticate
          showUnenrollmentConfirm.value = false;
          pendingUnenroll.value = true;
          showReauthenticate.value = true;
          alert(t("profile.totp.error.tokenExpired"));
        } else {
          alert(t("profile.totp.error.disableFailed"));
        }
      } finally {
        generalStore.setLoading(false);
      }
    };

    const handleReauthSuccess = async () => {
      // Reauthentication successful
      console.log(
        "handleReauthSuccess called, pendingUnenroll:",
        pendingUnenroll.value,
      );
      showReauthenticate.value = false;

      // Retry the unenroll operation after reauthentication
      if (pendingUnenroll.value) {
        console.log("Retrying unenroll after reauthentication");
        pendingUnenroll.value = false;
        await disableTotp();
      } else {
        // Proceed to enrollment after reauthentication
        console.log("Proceeding to enrollment after reauthentication");
        showEnrollment.value = true;
      }
    };

    const handleEnrollmentComplete = () => {
      showEnrollment.value = false;
      checkTotpEnrollment();
    };

    const handleEnrollmentSkip = () => {
      showEnrollment.value = false;
    };

    const handleEnrollmentNeedsReauth = () => {
      // Close enrollment modal and show reauthentication modal
      showEnrollment.value = false;
      showReauthenticate.value = true;
    };

    const startUnenrollment = () => {
      showUnenrollmentConfirm.value = true;
    };

    return {
      user,
      isTotpEnrolled,
      totpStatus,
      showReauthenticate,
      showEnrollment,
      showUnenrollmentConfirm,
      startEnrollment,
      handleReauthSuccess,
      handleEnrollmentComplete,
      handleEnrollmentSkip,
      handleEnrollmentNeedsReauth,
      startUnenrollment,
      disableTotp,
    };
  },
});
</script>
