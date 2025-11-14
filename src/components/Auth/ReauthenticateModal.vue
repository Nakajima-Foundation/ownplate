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
          />
          <div v-if="error" class="mt-2 text-sm text-red-600">
            {{ $t(error) }}
          </div>
        </div>
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
          @click="handleReauthenticate"
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
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useGeneralStore } from '@/store';

export default defineComponent({
  name: 'ReauthenticateModal',
  emits: ['success', 'cancel'],
  setup(_props, { emit }) {
    const generalStore = useGeneralStore();
    const password = ref('');
    const error = ref('');

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
        const credential = EmailAuthProvider.credential(
          user.email,
          password.value
        );
        await reauthenticateWithCredential(user, credential);

        // Force token refresh after reauthentication
        await user.getIdToken(true);

        emit('success');
      } catch (e: any) {
        console.error('Reauthentication failed:', e);
        if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
          error.value = 'admin.error.code.auth/wrong-password';
        } else {
          error.value = 'auth.reauthenticate.error.failed';
        }
      } finally {
        generalStore.setLoading(false);
      }
    };

    return {
      password,
      error,
      handleReauthenticate,
    };
  },
});
</script>
