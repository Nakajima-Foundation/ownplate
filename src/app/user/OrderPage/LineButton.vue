<template>
  <div v-if="showAddLine" class="mt-6 text-center">
    <b-button @click="handleLineAuth" class="b-reset-tw">
      <div
        class="inline-flex justify-center items-center h-12 px-6 rounded-full"
        style="background: #18b900"
        >
        <i class="fab fa-line text-2xl text-white mr-2" />
        <div class="text-base font-bold text-white">
          {{ $t("line.notifyMe") }}
        </div>
      </div>
    </b-button>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import { lineAuthURL } from "@/lib/line/line";
import { ownPlateConfig } from "@/config/project";

export default defineComponent({
  setup(props, ctx) {
    const handleLineAuth = () => {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname,
      });
      location.href = url;
    };
    const showAddLine = computed(() => {
      // return true;
      return !!ownPlateConfig.line, !ctx.root.$store.state.claims?.line;
    });
    return {
      handleLineAuth,
      showAddLine,
    };
  }
});
</script>
