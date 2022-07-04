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

<script>
import {
  defineComponent,
  computed,
} from "@vue/composition-api";

import {
  useIsInMo,
  getMoPrefix
} from "@/utils/utils";

export default defineComponent({
  setup(_, ctx) {
    const isInMo = useIsInMo(ctx.root);

    const termsPath = computed(() => {
      if (isInMo.value) {
        return "/" + getMoPrefix(ctx.root) + "/terms";
      } else {
        return "/terms/user";
      }
    });
    const policyPath = computed(() => {
      if (isInMo.value) {
        return "/" + getMoPrefix(ctx.root) + "/privacy";
      } else {
        return "/privacy";
      }
    });
    return {
      termsPath,
      policyPath,
    };
  },
})
</script>
