<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Requests</h2>
    <table>
      <tr>
        <td>Name</td>
        <td>List</td>
        <td>Pub</td>
        <td>Delete</td>
        <td>Status</td>
      <tr
      v-for="request in requests"
      :key="request.id"
      >
        <td style="width: 50%">
          <router-link :to="`/r/${request.id}`">
            {{(restaurantsObj[request.id] || {}).restaurantName}}
          </router-link>
        </td>
        <td>
          {{(restaurantsObj[request.id] || {}).onTheList ? "o":"-"}}
        </td>
        <td>
          {{(restaurantsObj[request.id] || {}).publicFlag  ? "o":"-"}}
        </td>
        <td>
          {{(restaurantsObj[request.id] || {}).deletedFlag ? "o":"-"}}
        </td>
        <td>
          <span>
            {{request.status == 1 ? "request" : ""}}
          </span>
        </td>
        <td>
          <span v-if="!restaurantsObj[request.id] || !restaurantsObj[request.id].onTheList">
             <b-button @click="enableList(restaurantsObj[request.id].id)">Enable</b-button>
          </span>
          <span v-else>
            On the list
          </span>
        </td>
      </tr>
    </table>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import * as firebase from "firebase/app";

export default {
  components: {
    BackButton
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
      .limit(100)
      .orderBy("created", "desc")
      .onSnapshot(async snapshot => {
        this.requests = snapshot.docs.map(this.doc2data("request"));
        const ids =  this.requests.map((a) => a.id);
        this.arrayChunk(ids, 10).map(async (arr) => {
          const resCols = await db.collection('restaurants')
                .where(
                  firebase.firestore.FieldPath.documentId(),
                  'in',
                  arr
                ).get();
          if (!resCols.empty) {
            this.restaurantsObj = Object.assign({}, this.restaurantsObj, this.array2obj(resCols.docs.map(this.doc2data("restaurant"))));
          }
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
  methods: {
    arrayChunk(arr, size = 1) {
      const array = [...arr];
      return array.reduce((current, value, index) => {
        return index % size ? current : [...current, array.slice(index, index + size)];
      }, []);
    },
    enableList(id) {
      db.doc(`restaurants/${id}`).update("onTheList", true);
      const tmp = Object.assign({}, this.restaurantsObj);
      tmp[id].onTheList = true;
      this.restaurantsObj = tmp;
    }
  }
};
</script>
