<template>
  <span>
    <section class="section" style="background-color:#fffafa">
      <form @submit.prevent="handleSubmit">
        <b-field :label="$t('restaurantId.self')">
          <b-input type="text"
            v-model="rid"
            v-on:input="validate"
            maxlength="30"
            :placeholder="$t('restaurantId.placeholder')" />
        </b-field>
        <ul v-if="errors.length > 0">
          <li v-for="error in errors" :key="error">
            {{$t(error)}}
          </li>
        </ul>
        <div>
          <button
            class="button is-info is-rounded"
            :disabled="errors.length > 0"
            type="submit">
            Submit
          </button>
        </div>
        <p v-if="errors.length === 0">
          The web page will be created at: https://ownplate.today/r/{{ rid }}
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
      rid:"" // restaurantId (for some reason, there is a method restaurantId. What is this?)
    };
  },
  methods: {
    async validate() {
      const rid = this.rid
      this.errors = []
      const regex = /^\w*$/
      if (rid.length < 5) {
        this.errors.push("restaurantId.tooshort")
      }
      if (!regex.test(rid)) {
        this.errors.push("restaurantId.invalid")
      }
      if (this.errors.length > 0) {
        return // no need to check the database
      }
      const doc = await db.doc(`restaurants/${rid}`).get();
      if (this.rid !== rid) {
        return // the user has already changed the text
      }
      if (doc.exists) {
        this.errors.push("restaurantId.alreadyTaken")
      }
    },
    async handleSubmit() {
      console.log("handleSubmit");
      const context = { restaurantId:this.rid };
      const createRestaurant = functions.httpsCallable('createRestaurant');
      const result = (await createRestaurant(context)).data;
      console.log("result", result);
      if (result.result) {
        this.$router.push(`./${this.rid}/edit`)
      } else {
        this.errors = [result.message]
      }
    }
  }
};
</script>

<style lang="scss">
</style>
