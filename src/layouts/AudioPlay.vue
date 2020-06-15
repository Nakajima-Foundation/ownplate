<template>
  <div>
    <iframe src="/silence.mp3" allow="autoplay" id="audio_s" style="display:none"></iframe>
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
      if (!this.pleyedSilent) {
        console.log("default: enableSound");

        this.pleyedSilent = true;
        this.$store.commit("soundEnable");
      }
    },
    async play() {
      console.log(this.$refs.audio)
      // this.$refs.source.src = this.soundFile;
      this.$refs.audio.setAttribute("src", this.soundFile);
      //  a.src = this.soundFile;
      // this.$refs.audio.pause();
      this.$refs.audio.currentTime = 0;
      await this.$refs.audio.play();
      return;
    },
  },
  watch: {
    async "$store.state.orderEvent"() {
      await this.play();
      console.log(`soundEnable = ${this.$store.state.soundEnable}, soundOn=${this.$store.state.soundOn}, soundFile=${this.$store.state.soundFile}`);
      console.log(this.$store.state.orderEvent);
    },
  }
}
</script>
