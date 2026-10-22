<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, watch, PropType } from "vue";

import { soundFiles } from "@/config/constant";
import { getSoundIndex } from "@/utils/utils";
import { useGeneralStore } from "@/store";

// 保存された通知設定。まだ保存されていない項目は null で入っている。
type NotificationConfig = {
  soundOn?: boolean | null;
  infinityNotification?: boolean | null;
  nameKey?: string | null;
};

export default defineComponent({
  props: {
    notificationConfig: {
      type: Object as PropType<NotificationConfig>,
      required: true,
    },
  },
  setup(props) {
    const generalStore = useGeneralStore();

    const update = (newData: NotificationConfig) => {
      const soundIndex = getSoundIndex(newData.nameKey);
      generalStore.setSoundOn(newData.soundOn === true);
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
