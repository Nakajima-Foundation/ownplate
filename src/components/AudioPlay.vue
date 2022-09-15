<template>
  <div>
    <audio id="audio" ref="audio" :src="soundFile"></audio>
  </div>
</template>
<script>
import { defineComponent, ref, computed, watch } from "@vue/composition-api";

export default defineComponent({
  setup(props, ctx) {
    const pleyedSilent = ref(false);
    const soundFile = computed(() => {
      return ctx.root.$store.state.soundFile;
    });

    const enableSound = async () => {
      console.log("enableSound");
      if (!pleyedSilent.value) {
        console.log("silent play");
        try {
          ctx.refs.audio.setAttribute("src", "/silence.mp3");
          ctx.refs.audio.currentTime = 0;
          await ctx.refs.audio.play();

          pleyedSilent.value = true;
          ctx.root.$store.commit("soundEnable");
        } catch (e) {
          console.log(e);
          console.log("error");
        }
      }
    };
    const play = async () => {
      try {
        ctx.refs.audio.setAttribute("src", soundFile.value);
        ctx.refs.audio.currentTime = 0;
        await ctx.refs.audio.play();
      } catch (e) {
        console.log(e);
      }
      return;
    };
    const event = computed(() => {
      return ctx.root.$store.state.orderEvent;
    });
    watch(event, async () => {
      await play();
      console.log(
        `soundEnable = ${ctx.root.$store.state.soundEnable}, soundOn=${ctx.root.$store.state.soundOn}, soundFile=${ctx.root.$store.state.soundFile}`
      );
    });
    return {
      enableSound,
      soundFile,
    };
  },
});
</script>
