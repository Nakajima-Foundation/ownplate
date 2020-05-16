<template>
<div>
  <div @click="play()">
    <span>hello</span>
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
    this.play();
  },
  methods: {
    play() {
      const fileplay = () => {
        console.log("call play");
        this.mySound.currentTime = 0;
        this.mySound.play().catch(() => {
          console.log("sound not enabled");
        });
        setTimeout(() => {
          console.log("played");
          fileplay();
        }, 3000);
      };
      if (!this.played) {
        fileplay();
        this.played = true;
      }
    }
  },

}
</script>
