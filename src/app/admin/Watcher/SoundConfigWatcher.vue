<template></template>

<script lang="ts">
import { defineComponent, watch } from "@vue/composition-api";

import { soundFiles } from "@/config/constant";
import { getSoundIndex } from "@/utils/utils";

export default defineComponent({
  props: {
    notificationConfig: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const update = (newData: any) => {
      const soundIndex = getSoundIndex(newData.nameKey);
      ctx.root.$store.commit("setSoundOn", newData.soundOn);
      ctx.root.$store.commit("setSoundFile", soundFiles[soundIndex].file);
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
