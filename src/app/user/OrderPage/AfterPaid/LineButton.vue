<template>
  <div v-if="showAddLine && enableLine" class="mt-6 text-center">
    <o-button @click="handleLineAuth" class="b-reset-tw">
      <div
        class="inline-flex h-12 items-center justify-center rounded-full px-6"
        style="background: #18b900"
      >
        <i class="fab fa-line mr-2 text-2xl text-white" />
        <div class="text-base font-bold text-white">
          {{ $t("line.notifyMe") }}
        </div>
      </div>
    </o-button>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";
import { lineAuthURL } from "@/lib/line/line";
import { ownPlateConfig } from "@/config/project";

import { useStore } from "vuex";

export default defineComponent({
  props: {
    groupData: {
      type: Object,
      required: false,
    },
  },
  setup(props) {
    const store = useStore();

    const handleLineAuth = () => {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname,
      });
      location.href = url;
    };
    const showAddLine = computed(() => {
      // return true;
      return !!ownPlateConfig.line, !store.state.claims?.line;
    });
    const enableLine = computed(() => {
      if (props.groupData?.enableLine === undefined) {
        return true;
      }
      return props.groupData?.enableLine;
    });
    return {
      handleLineAuth,
      showAddLine,
      enableLine,
    };
  },
});
</script>
