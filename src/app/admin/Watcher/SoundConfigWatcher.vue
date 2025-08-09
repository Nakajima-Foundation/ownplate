<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";

import { soundFiles } from "@/config/constant";
import { getSoundIndex } from "@/utils/utils";
import { useGeneralStore } from "../../../store";

export default defineComponent({
  props: {
    notificationConfig: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const generalStore = useGeneralStore();

    const update = (newData: any) => {
      const soundIndex = getSoundIndex(newData.nameKey);
      generalStore.setSoundOn(newData.soundOn);
      generalStore.setSoundFile(soundFiles[soundIndex].file);
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
