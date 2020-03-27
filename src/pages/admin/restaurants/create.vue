<template>
  <span>
    <section class="section" style="background-color:#fffafa">
      <input type="text" v-model="restaurantId" placeholder="Restaurant Id" />
      <p>URL: https://ownplate.today/r/{{ restaurantId }}</p>
    </section>
  </span>
</template>

<script> 
export default {
  data() {
    return {
      restaurantId:""
    };
  }
};
</script>

<style lang="scss">
</style>
