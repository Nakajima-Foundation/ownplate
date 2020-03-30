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
  methods: {
    goBack() {
      this.$router.push({
        path: `/admin/restaurants/`
      });
    }
  }
}
</script>