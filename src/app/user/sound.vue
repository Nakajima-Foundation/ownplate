<template>
<div>
  <div @click="play()">
    <span>hello</span>
    <audio src="/silent.mp3" ref="audio"></audio>
  </div>
</div>
</template>

<script>
export default {
  name: "Sound",
  data() {
    return {
      mySound: null,
      call: false,
    };
  },
  created() {
    this.mySound = new Audio(["/hello.mp3"]);
  },
  methods: {
    play() {
      const audio = this.$refs.audio;

      if (audio.paused) {
        const fileplay = () => {
          console.log("call play");
          setTimeout(() => {
            this.mySound.currentTime = 0;
            this.mySound.play();
            console.log("played");
            fileplay();
          }, 3000);
        };
        fileplay();

        console.log("WILL PLAY");
        audio.play();

        audio.addEventListener('ended', (event) => {
          console.log("PLAYING");
          audio.currentTime = 0;
          audio.play();
        });
      }

    }
  },

}
</script>
