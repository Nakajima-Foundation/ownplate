<template>
  <section class="section">
    <h2>Your Restaurant</h2>
    <div>No restaurant</div>
    <a href="/admin/restaurants/new">
      <b-button
        style="margin-right:auto"
        type="is-info"
        class="counter-button"
        expanded
        rounded
      >
        Add new restaurant
      </b-button>
    </a>
  </section>
</template>

<script>
export default {
  name: "Restaurant",
  data() {},
  computed: {},
  methods: {}
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
