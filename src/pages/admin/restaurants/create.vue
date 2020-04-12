
<template>
  <span>
    <section class="section" style="background-color:#fffafa">
      <form @submit.prevent="handleSubmit">
        <b-field
          :type="hasError ? 'is-danger' : 'is-success'"
          :message="hasError ? $t(errors[0]) : $t('restaurantId.available')"
          :label="$t('restaurantId.self')">
          <b-input type="text"
            v-model="rid"
            v-on:input="validate"
            maxlength="30"
            :placeholder="$t('restaurantId.placeholder')" />
        </b-field>
        <div>
          <b-button
            class="button is-primary is-rounded"
            :disabled="hasError"
            :loading="isLoading"
            @click="handleSubmit">
            {{ $t('restaurantId.submit')}}
          </b-button>
        </div>
      </form>
    </section>
  </span>
</template>

<script>
import { db, functions } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      isLoading: false,
      errors:["restaurantId.tooshort"],
      rid:"" // restaurantId (for some reason, there is a method restaurantId. What is this?)
    };
  },
  computed: {
    hasError() {
      return this.errors.length > 0
    }
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
      this.isLoading = true;
      const result = (await createRestaurant(context)).data;
      this.isLoading = false;
      console.log("result", result);
      if (result.result) {
        this.$router.push(`/admin/restaurants/${this.rid}`)
      } else {
        this.errors = [result.message]
      }
    }
  }
};
</script>

<style lang="scss">
</style>
