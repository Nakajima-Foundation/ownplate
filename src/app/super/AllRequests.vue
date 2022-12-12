<template>
  <section class="mx-auto max-w-full px-6 pb-12 pt-4">
    <back-button url="/s" />
    <h2>All Requests</h2>
    <table>
      <tr>
        <td>Name</td>
        <td>List</td>
        <td>Pub</td>
        <td>Delete</td>
        <td>Status</td>
      </tr>

      <tr v-for="request in requests" :key="request.id">
        <td style="width: 50%">
          <router-link
            :to="`/r/${request.id}`"
            class="text-sm font-bold text-op-teal"
          >
            {{ (restaurantsObj[request.id] || {}).restaurantName }}
          </router-link>
        </td>
        <td>
          {{ (restaurantsObj[request.id] || {}).onTheList ? "o" : "-" }}
        </td>
        <td>
          {{ (restaurantsObj[request.id] || {}).publicFlag ? "o" : "-" }}
        </td>
        <td>
          {{ (restaurantsObj[request.id] || {}).deletedFlag ? "o" : "-" }}
        </td>
        <td>
          <span>
            {{ request.status == 1 ? "request" : "" }}
          </span>
        </td>
        <td>
          <span
            v-if="
              !restaurantsObj[request.id] ||
              !restaurantsObj[request.id].onTheList
            "
          >
            <o-button @click="enableList(restaurantsObj[request.id].id)"
              >Enable</o-button
            >
          </span>
          <span v-else> On the list </span>
        </td>
      </tr>
    </table>
  </section>
</template>

<script>
import { db } from "@/plugins/firebase";
import firebase from "firebase/compat/app";

import { doc2data, array2obj, arrayChunk } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";

export default {
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Requests"].join(" / "),
    };
  },
  components: {
    BackButton,
  },
  data() {
    return {
      requests: [],
      detacher: null,
      restaurantsObj: {},
    };
  },
  async mounted() {
    if (!this.$store.state.user || this.$store.getters.isNotSuperAdmin) {
      this.$router.push("/");
    }
  },
  created() {
    this.detatcher = db
      .collection("requestList")
      .limit(500)
      .orderBy("created", "desc")
      .onSnapshot(async (snapshot) => {
        this.requests = snapshot.docs.map(doc2data("request"));
        const ids = this.requests.map((a) => a.id);
        arrayChunk(ids, 10).map(async (arr) => {
          const resCols = await db
            .collection("restaurants")
            .where(firebase.firestore.FieldPath.documentId(), "in", arr)
            .get();
          if (!resCols.empty) {
            this.restaurantsObj = Object.assign(
              {},
              this.restaurantsObj,
              array2obj(resCols.docs.map(doc2data("restaurant")))
            );
          }
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
  methods: {
    enableList(id) {
      db.doc(`restaurants/${id}`).update("onTheList", true);
      const tmp = Object.assign({}, this.restaurantsObj);
      tmp[id].onTheList = true;
      this.restaurantsObj = tmp;
    },
  },
};
</script>
