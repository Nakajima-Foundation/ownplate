<template>
  <div>
    <div v-if="!isLocaleJapan">
      <span>By submitting this form, you agree to the</span>
      <router-link :to="termsPath" target="_blank">
        <span class="text-op-teal">Terms of Service</span>
      </router-link>
      <span>and</span>
      <router-link :to="policyPath" target="_blank">
        <span class="text-op-teal">Privacy Policy</span>
      </router-link>
      <span>.</span>
    </div>

    <div v-else>
      <span>送信することで、</span>
      <router-link :to="termsPath" target="_blank">
        <span class="text-op-teal">利用規約</span>
      </router-link>
      <span>と</span>
      <router-link :to="policyPath" target="_blank">
        <span class="text-op-teal">プライバシーポリシー</span>
      </router-link>
      <span>に同意したものとみなされます。</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

import { useIsLocaleJapan } from "@/utils/utils";

export default defineComponent({
  setup() {
    const isLocaleJapan = useIsLocaleJapan();

    const termsPath = computed(() => {
      return "/terms/user";
    });
    const policyPath = computed(() => {
      return "/privacy";
    });
    return {
      termsPath,
      policyPath,
      isLocaleJapan,
    };
  },
});
</script>
