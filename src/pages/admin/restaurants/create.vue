<template>
  <span>
    <section class="section" style="background-color:#fffafa">
      <input type="text" v-model="restaurantId" placeholder="Restaurant Id" 
       v-on:input="validate"/>
      <p>{{errors}}</p>
      <p>URL: https://ownplate.today/r/{{ restaurantId }}</p>
    </section>
  </span>
</template>

<script> 
export default {
  data() {
    return {
      errors:["no error 1"],
      restaurantId:""
    };
  },
  methods: {
    validate() {
      console.log("validate", this.restaurantId)
      this.errors = [];
      if (this.restaurantId.length < 5) {
        this.errors.push("too short")
      }
    }
  }
};
</script>

<style lang="scss">
</style>
