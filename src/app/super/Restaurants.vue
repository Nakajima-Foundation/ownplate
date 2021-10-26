<template>
  <div>
    <section class="section">
      <back-button :url="backUrl" />
    </section>
    <div v-if="restaurantData === null">
      loading
    </div>
    <div v-else>
      <div>
      {{restaurantData.restaurantName}}
      </div>
      <div>
      <button @click="hello">
        hello
      </button>
      </div>
    </div>
  </div>
</template>

<script>
// TODO: 通知の状況もわかるようにする
//
import BackButton from "~/components/BackButton";
import superMixin from "./SuperMixin";
import { db, functions } from "~/plugins/firebase.js";

export default {
  mixins: [superMixin],
  head() {
    return {
      title: [this.defaultTitle, "Super All Restaurants"].join(" / ")
    }
  },
  components: {
    BackButton
  },
  data() {
    return {
      restaurantData: null,
    }
  },
  async created() {
    this.restaurantData = (await db.doc(`restaurants/${this.restaurantId()}`).get()).data();
  },
  methods: {
    hello: async function() {
      if (confirm("ok")) {
        const superTwilio = functions.httpsCallable("superTwilio");
        const ret = await superTwilio({restaurantId: this.restaurantId()});
      }
    },
  },
}
</script>
