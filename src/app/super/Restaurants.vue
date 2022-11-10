<template>
  <div>
    <section class="mx-auto max-w-full px-6 pb-12 pt-4">
      <back-button :url="backUrl" />
    </section>
    <div v-if="restaurantData === null">loading</div>
    <div v-else>
      <div>
        {{ restaurantData.restaurantName }}
      </div>
      <div>
        <button @click="hello">hello</button>
      </div>
    </div>
  </div>
</template>

<script>
// TODO: 通知の状況もわかるようにする
//
import { db } from "@/plugins/firebase";
import { superTwilio } from "@/lib/firebase/functions";

import superMixin from "@/mixins/SuperMixin";

import BackButton from "@/components/BackButton.vue";

export default {
  mixins: [superMixin],
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Restaurants"].join(" / "),
    };
  },
  components: {
    BackButton,
  },
  data() {
    return {
      restaurantData: null,
    };
  },
  async created() {
    this.restaurantData = (
      await db.doc(`restaurants/${this.restaurantId()}`).get()
    ).data();
  },
  methods: {
    hello: async function () {
      if (confirm("ok")) {
        const ret = await superTwilio({ restaurantId: this.restaurantId() });
      }
    },
  },
};
</script>
