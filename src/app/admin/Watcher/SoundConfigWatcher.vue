<template>
  <div />
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";

import { soundFiles } from "@/config/constant";
import { getSoundIndex } from "@/utils/utils";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    notificationConfig: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();

    const update = (newData: any) => {
      const soundIndex = getSoundIndex(newData.nameKey);
      store.commit("setSoundOn", newData.soundOn);
      store.commit("setSoundFile", soundFiles[soundIndex].file);
    };
    watch(props.notificationConfig, (newData) => {
      update(newData);
    });
    if (props.notificationConfig) {
      update(props.notificationConfig);
    }
  },
});
</script>
