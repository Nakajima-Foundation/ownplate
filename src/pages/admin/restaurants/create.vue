<template>
  <span>
    <section class="section" style="background-color:#fffafa">
      <form @submit.prevent="handleSubmit">
        <div>
          <input type="text"
            v-model="restaurantId"
            v-on:input="validate"
            placeholder="Restaurant Id" />
        </div>
        <ul v-if="errors.length > 0">
          <li v-for="error in errors" :key="error">
            {{$t(error)}}
          </li>
        </ul>
        <div>
          <button
            :disabled="errors.length > 0"
            type="submit">
            Submit
          </button>
        </div>
        <p v-if="errors.length === 0">
          The web page will be created at: https://ownplate.today/r/{{ restaurantId }}
        </p>
      </form>
    </section>
  </span>
</template>

<script>
import { db, functions } from "~/plugins/firebase.js";
export default {
  data() {
    return {
      errors:["restaurantId.tooshort"],
      restaurantId:""
    };
  },
  methods: {
    async validate() {
      const restaurantId = this.restaurantId
      this.errors = []
      const regex = /^\w*$/
      if (restaurantId.length < 5) {
        this.errors.push("restaurantId.tooshort")
      }
      if (!regex.test(restaurantId)) {
        this.errors.push("restaurantId.invalid")
      }
      if (this.errors.length > 0) {
        return // no need to check the database
      }
      const doc = await db.doc(`restaurants/${restaurantId}`).get();
      if (this.restaurantId !== restaurantId) {
        return // the user has already changed the text
      }
      if (doc.exists) {
        this.errors.push("restaurantId.alreadytaken")
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
