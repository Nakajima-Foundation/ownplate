<template>
  <span class="text-xs text-white text-opacity-50">
    <template v-if="!isInMo"> Operated by Singularity Society </template>
    <template v-else>
      {{ $t("mobileOrder.name") }} powered by おもちかえり.com
    </template>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { useIsInMo } from "@/utils/utils";

export default defineComponent({
  setup(_, ctx) {
    const isInMo = useIsInMo();
    return {
      isInMo,
    };
  },
});
</script>
