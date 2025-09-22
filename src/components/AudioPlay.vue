<template>
  <div>
    <audio id="audio" ref="audioRef" :src="soundFile"></audio>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useGeneralStore } from "../store";

export default defineComponent({
  setup() {
    const generalStore = useGeneralStore();

    const playedSilent = ref(false);
    const audioRef = ref();
    const soundFile = computed(() => {
      return generalStore.soundFile;
    });

    const enableSound = async () => {
      if (!playedSilent.value) {
        try {
          audioRef.value.setAttribute("src", "/silence.mp3");
          audioRef.value.currentTime = 0;
          await audioRef.value.play();

          playedSilent.value = true;
          generalStore.setSoundEnable();
        } catch (e) {
          console.log(e);
          console.log("error");
        }
      }
    };
    const play = () => {
      try {
        audioRef.value.setAttribute("src", soundFile.value);
        audioRef.value.currentTime = 0;
        audioRef.value.play();
      } catch (e) {
        console.log(e);
      }
    };
    const event = computed(() => {
      return generalStore.orderEvent;
    });
    watch(event, async () => {
      await play();
      console.log(
        `soundEnable = ${generalStore.soundEnable}, soundOn=${generalStore.soundOn}, soundFile=${generalStore.soundFile}`,
      );
    });
    return {
      enableSound,
      soundFile,
      audioRef,
    };
  },
});
</script>
