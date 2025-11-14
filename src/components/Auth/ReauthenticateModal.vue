<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <div class="text-xl font-bold text-black/30">
        {{ $t('auth.reauthenticate.title') }}
      </div>

      <div class="mt-4 text-sm">
        {{ $t('auth.reauthenticate.message') }}
      </div>

      <!-- Password Input -->
      <div class="mt-4">
        <div class="text-sm font-bold">
          {{ $t('admin.password') }}
        </div>
        <div class="mt-1">
          <input
            v-model="password"
            type="password"
            :placeholder="$t('admin.passwordPlaceHolder')"
            class="w-full rounded border px-3 py-2"
            :class="error ? 'border-red-500' : 'border-gray-300'"
            @keyup.enter="handleReauthenticate"
            :disabled="needsTotpCode"
          />
        </div>
      </div>

      <!-- TOTP Code Input (shown if MFA is required) -->
      <div v-if="needsTotpCode" class="mt-4">
        <div class="text-sm font-bold">
          {{ $t('admin.totp.enterCode') }}
        </div>
        <div class="mt-1">
          <input
            v-model="totpCode"
            type="text"
            :placeholder="$t('admin.totp.codePlaceholder')"
            maxlength="6"
            class="w-full rounded border px-3 py-2"
            :class="error ? 'border-red-500' : 'border-gray-300'"
            @keyup.enter="handleTotpReauth"
          />
        </div>
      </div>

      <div v-if="error" class="mt-2 text-sm text-red-600">
        {{ $t(error) }}
      </div>

      <!-- Buttons -->
      <div class="mt-6 flex justify-center gap-4">
        <button
          @click="$emit('cancel')"
          class="inline-flex h-12 w-32 cursor-pointer items-center justify-center rounded-full bg-black/5"
        >
          <div class="text-base font-bold text-black/60">
            {{ $t('button.cancel') }}
          </div>
        </button>
        <button
          @click="needsTotpCode ? handleTotpReauth() : handleReauthenticate()"
          class="inline-flex h-12 w-32 cursor-pointer items-center justify-center rounded-full bg-op-teal"
        >
          <div class="text-base font-bold text-white">
            {{ $t('button.verify') }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { auth } from '@/lib/firebase/firebase9';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  MultiFactorResolver,
} from 'firebase/auth';
import { useGeneralStore } from '@/store';

export default defineComponent({
  name: 'ReauthenticateModal',
  emits: ['success', 'cancel'],
  setup(_props, { emit }) {
    const generalStore = useGeneralStore();
    const password = ref('');
    const totpCode = ref('');
    const error = ref('');
    const needsTotpCode = ref(false);
    const mfaResolver = ref<MultiFactorResolver | null>(null);

    const handleReauthenticate = async () => {
      if (!password.value) {
        error.value = 'admin.error.password.tooshort';
        return;
      }

      const user = auth.currentUser;
      if (!user || !user.email) {
        error.value = 'auth.reauthenticate.error.noUser';
        return;
      }

      generalStore.setLoading(true);
      error.value = '';

      try {
        console.log('Starting reauthentication for:', user.email);
        const credential = EmailAuthProvider.credential(
          user.email,
          password.value
        );
        console.log('Credential created, calling reauthenticateWithCredential');
        const result = await reauthenticateWithCredential(user, credential);
        console.log('Reauthentication successful:', result);

        emit('success');
      } catch (e: any) {
        console.error('Reauthentication failed:', e);
        console.error('Error code:', e.code);
        console.error('Error message:', e.message);

        // Check if MFA is required
        if (e.code === 'auth/multi-factor-auth-required') {
          console.log('MFA required, showing TOTP input');
          mfaResolver.value = getMultiFactorResolver(auth, e);
          needsTotpCode.value = true;
          error.value = '';
          generalStore.setLoading(false);
          return;
        }

        if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
          error.value = 'admin.error.code.auth/wrong-password';
        } else {
          error.value = 'auth.reauthenticate.error.failed';
        }
      } finally {
        generalStore.setLoading(false);
      }
    };

    const handleTotpReauth = async () => {
      if (!totpCode.value || totpCode.value.length !== 6) {
        error.value = 'admin.totp.error.invalidCode';
        return;
      }

      if (!mfaResolver.value) {
        error.value = 'auth.reauthenticate.error.failed';
        return;
      }

      generalStore.setLoading(true);
      error.value = '';

      try {
        console.log('Resolving MFA for reauthentication');

        // Find TOTP factor
        const totpFactorInfo = mfaResolver.value.hints.find(
          (hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID
        );

        if (!totpFactorInfo) {
          throw new Error('TOTP factor not found');
        }

        // Create TOTP assertion for sign-in
        const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
          totpFactorInfo.uid,
          totpCode.value
        );

        // Complete reauthentication with multi-factor
        await mfaResolver.value.resolveSignIn(multiFactorAssertion);

        console.log('MFA reauthentication successful');
        emit('success');
      } catch (e: any) {
        console.error('TOTP reauthentication failed:', e);
        if (e.code === 'auth/invalid-verification-code') {
          error.value = 'admin.totp.error.invalidCode';
        } else {
          error.value = 'auth.reauthenticate.error.failed';
        }
      } finally {
        generalStore.setLoading(false);
      }
    };

    return {
      password,
      totpCode,
      error,
      needsTotpCode,
      handleReauthenticate,
      handleTotpReauth,
    };
  },
});
</script>
