<template>
  <b-button
    style="margin-right:auto"
    type="is-primary"
    class="counter-button"
    icon-left="arrow-left"
    rounded
    outlined
    @click="goBack()"
  >
    Back
  </b-button>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true
    }
  },
  methods: {
    goBack() {
      this.$router.push({
        path: this.url
      });
    }
  }
}
</script>