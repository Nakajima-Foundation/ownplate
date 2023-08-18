<template>
  <div>
    <audio id="audio" ref="audioRef" :src="soundFile"></audio>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();

    const pleyedSilent = ref(false);
    const audioRef = ref();
    const soundFile = computed(() => {
      return store.state.soundFile;
    });

    const enableSound = async () => {
      console.log("enableSound");
      if (!pleyedSilent.value) {
        console.log("silent play");
        try {
          audioRef.value.setAttribute("src", "/silence.mp3");
          audioRef.value.currentTime = 0;
          await audioRef.value.play();

          pleyedSilent.value = true;
          store.commit("soundEnable");
        } catch (e) {
          console.log(e);
          console.log("error");
        }
      }
    };
    const play = async () => {
      try {
        audioRef.value.setAttribute("src", soundFile.value);
        audioRef.value.currentTime = 0;
        await audioRef.value.play();
      } catch (e) {
        console.log(e);
      }
      return;
    };
    const event = computed(() => {
      return store.state.orderEvent;
    });
    watch(event, async () => {
      await play();
      console.log(
        `soundEnable = ${store.state.soundEnable}, soundOn=${store.state.soundOn}, soundFile=${store.state.soundFile}`
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
