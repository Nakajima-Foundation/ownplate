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
      errors:[],
      restaurantId:""
    };
  },
  methods: {
    validate() {
      console.log("validate", this.restaurantId)
      this.errors = []
      const regex = /^\w+$/
      if (this.restaurantId.length < 5) {
        this.errors.push("too short")
      }
      if (!regex.test(this.restaurantId)) {
        this.errors.push("invalid")
      }
    }
  }
};
</script>

<style lang="scss">
</style>
