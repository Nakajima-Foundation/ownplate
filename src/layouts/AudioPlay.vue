<template>
  <div>
    <audio id="audio" ref="audio" :src="soundFile">
    </audio>
  </div>
</template>
<script>
export default {
  data() {
    return {
      pleyedSilent: false,
    }
  },
  computed: {
    soundFile() {
      return this.$store.state.soundFile
    },
  },
  methods: {
    async enableSound() {
      console.log("enableSound");
      if (!this.pleyedSilent) {
        console.log("silent play");
        try {
          this.$refs.audio.setAttribute("src", "/silence.mp3");
          this.$refs.audio.currentTime = 0;
          await this.$refs.audio.play();

          this.pleyedSilent = true;
          this.$store.commit("soundEnable");
        } catch (e) {
          console.log(e);
          console.log("error");
        }
      }
    },
    async play() {
      this.$refs.audio.setAttribute("src", this.soundFile);
      this.$refs.audio.currentTime = 0;
      await this.$refs.audio.play();
      return;
    },
  },
  watch: {
    async "$store.state.orderEvent"() {
      await this.play();
      console.log(`soundEnable = ${this.$store.state.soundEnable}, soundOn=${this.$store.state.soundOn}, soundFile=${this.$store.state.soundFile}`);
    },
  }
}
</script>
