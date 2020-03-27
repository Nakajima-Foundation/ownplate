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
import { db } from "~/plugins/firebase.js";
export default {
  data() {
    return {
      errors:[],
      restaurantId:""
    };
  },
  methods: {
    async validate() {
      const restaurantId = this.restaurantId
      this.errors = []
      const regex = /^\w+$/
      if (restaurantId.length < 5) {
        this.errors.push("too short")
      }
      if (!regex.test(restaurantId)) {
        this.errors.push("invalid")
      }
      if (this.errors.length > 0) {
        return // no need to check the database
      }
      const doc = await db.doc(`restaurants/${restaurantId}`).get();
      if (this.restaurantId !== restaurantId) {
        return // the user has already changed the text
      }
      if (doc.exists) {
        this.errors.push("already taken")
      }
    }
  }
};
</script>

<style lang="scss">
</style>
