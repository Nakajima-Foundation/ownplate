<template>
<div>
  <div @click="play()">
    <span>hello</span>
    <audio src="/silent.mp3" ref="audio" preload="auto"></audio>
  </div>
</div>
</template>

<script>
export default {
  name: "Sound",
  data() {
    return {
      mySound: null,
      // call: false,
      played: false,
    };
  },
  created() {
    this.mySound = new Audio(["/hello.mp3"]);
    this.mySound.preload = "auto";
  },
  methods: {
    play() {
      const audio = this.$refs.audio;

      if (!this.played &&audio.paused) {
        this.played = true;
        const fileplay = () => {
          console.log("call play");
          this.mySound.currentTime = 0;
          this.mySound.play();
          setTimeout(() => {
            console.log("played");
            fileplay();
          }, 3000);
        };
        fileplay();

        console.log("WILL PLAY");
        audio.play();

        audio.addEventListener('ended', (event) => {
          console.log("ended");
          // audio.currentTime = 0;
          // audio.play();
        });
      }

    }
  },

}
</script>
