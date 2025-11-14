<template>
  <div class="rounded-lg bg-white p-6 shadow-sm">
    <div class="text-xl font-bold text-black/30">
      {{ $t('admin.totp.setup') }}
    </div>

    <div v-if="!enrollmentComplete" class="mt-4">
      <!-- QR Code Display -->
      <div v-if="qrCodeUrl" class="text-center">
        <div class="text-sm font-bold mb-2">
          {{ $t('admin.totp.scanQrCode') }}
        </div>
        <img :src="qrCodeUrl" alt="QR Code" class="mx-auto max-w-xs" />

        <div class="mt-4 text-sm">
          <div class="font-bold">{{ $t('admin.totp.orEnterManually') }}</div>
          <code class="bg-gray-100 px-2 py-1 rounded">{{ secret }}</code>
        </div>
      </div>

      <!-- Verification Code Input -->
      <div class="mt-4">
        <div class="text-sm font-bold">
          {{ $t('admin.totp.enterCode') }}
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
          {{ $t('button.skip') }}
        </t-button>
        <t-button @click="verifyAndEnroll" class="h-12 w-32 font-bold text-white">
          {{ $t('button.verify') }}
        </t-button>
      </div>
    </div>

    <div v-else class="mt-4 text-center">
      <i class="material-icons text-green-600 text-6xl">check_circle</i>
      <div class="mt-2 text-lg font-bold">
        {{ $t('admin.totp.enrollmentComplete') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { auth } from '@/lib/firebase/firebase9';
import {
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
} from 'firebase/auth';
import { useGeneralStore } from '@/store';

export default defineComponent({
  name: 'TotpEnrollment',
  emits: ['complete', 'skip'],
  setup(_props, { emit }) {
    const generalStore = useGeneralStore();
    const qrCodeUrl = ref('');
    const secret = ref('');
    const verificationCode = ref('');
    const error = ref('');
    const enrollmentComplete = ref(false);
    const totpSecret = ref<TotpSecret | null>(null);

    onMounted(async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user signed in');
        }

        // Force token refresh to ensure we have a valid token
        await user.getIdToken(true);

        // Get multi-factor session
        const multiFactorSession = await multiFactor(user).getSession();

        // Generate TOTP secret using the session
        totpSecret.value = await TotpMultiFactorGenerator.generateSecret(
          multiFactorSession
        );

        // Generate QR code URL
        qrCodeUrl.value = totpSecret.value.generateQrCodeUrl(
          user.email || 'user@example.com',
          'OwnPlate'
        );
        secret.value = totpSecret.value.secretKey;
      } catch (e: any) {
        console.error('Failed to generate TOTP secret:', e);
        error.value = 'admin.totp.error.generateFailed';
      }
    });

    const verifyAndEnroll = async () => {
      if (!verificationCode.value || verificationCode.value.length !== 6) {
        error.value = 'admin.totp.error.invalidCode';
        return;
      }

      generalStore.setLoading(true);
      error.value = '';

      try {
        const user = auth.currentUser;
        if (!user || !totpSecret.value) {
          throw new Error('No user or secret available');
        }

        // Create TOTP assertion
        const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
          totpSecret.value,
          verificationCode.value
        );

        // Enroll the factor
        await multiFactor(user).enroll(multiFactorAssertion, 'TOTP');

        enrollmentComplete.value = true;
        setTimeout(() => {
          emit('complete');
        }, 2000);
      } catch (e: any) {
        console.error('Failed to enroll TOTP:', e);
        error.value = 'admin.totp.error.enrollmentFailed';
      } finally {
        generalStore.setLoading(false);
      }
    };

    const handleSkip = () => {
      emit('skip');
    };

    return {
      qrCodeUrl,
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
