<template>
  <span>
    <section class="section" style="background-color:#fffafa">
      <form @submit.prevent="handleSubmit">
        <input type="text" v-model="restaurantId" placeholder="Restaurant Id" 
        v-on:input="validate"/>
        <p>{{errors}}</p>
        <p>URL: https://ownplate.today/r/{{ restaurantId }}</p>
        <button type="submit">Submit</button>
      </form>
    </section>
  </span>
</template>

<script> 
import { db, functions } from "~/plugins/firebase.js";
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
    },
    async handleSubmit() {
      console.log("handleSubmit");
      const context = { restaurantId:this.restaurantId };
      const createRestaurant = functions.httpsCallable('createRestaurant');
      const result = (await createRestaurant(context)).data;
      console.log("result", result);
    }
  }
};
</script>

<style lang="scss">
</style>
