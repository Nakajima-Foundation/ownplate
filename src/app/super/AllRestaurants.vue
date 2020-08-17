<template>
  <section class="section">
    <back-button :url="backUrl" />
    <h2>All Restaurants</h2>
    <table>
      <tr><td>nama</td><td></td><td>掲載</td><td>公開</td><td>削除</td><td>メニュー数</td></tr>
      <tr
      v-for="restaurant in restaurants"
      :key="restaurant.id"
      >
        <td style="width: 50%">
          <router-link :to="`/r/${restaurant.id}`" v-if="restaurant.publicFlag && !restaurant.deletedFlag">
            {{restaurant.restaurantName}}
          </router-link>
          <span v-else>
            {{restaurant.restaurantName}}
          </span>
        </td>
        <td><router-link :to="`/s/admins/${restaurant.uid}`">管理人</router-link></td>
        <td>
          {{restaurant.onTheList ? "o":"-"}}
        </td>
        <td>
          {{restaurant.publicFlag  ? "o":"-"}}
        </td>
        <td>
          {{restaurant.deletedFlag ? "o":"-"}}
        </td>
        <td>
          {{(restaurant.menuLists||[]).length || "-"}}
        </td>
      </tr>
    </table>
    <button @click="nextLoad">next</button>
  </section>
</template>

<script>
// TODO: 通知の状況もわかるようにする
//
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";

import superMixin from "./SuperMixin";

export default {
  mixins: [superMixin],
  components: {
    BackButton
  },
  data() {
    return {
      restaurants: [],
      isLoading: false,
      last: null,
    };
  },
  async mounted() {
    this.superPermissionCheck();
  },
  async created() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      if (!this.isLoading) {
        this.isLoading = true;
        let query = db
            .collection("restaurants")
            .orderBy("createdAt", "desc")
            .limit(100)
        if (this.last) {
          query = query.startAfter(this.last);
        }
        const snapshot = await query.get();
        if (!snapshot.empty) {
          this.last = snapshot.docs[snapshot.docs.length -1];
          snapshot.docs.map(this.doc2data("resuatraut")).forEach(data => {
            this.restaurants.push(data);
          });
        } else {
          this.last = null;
        }
      }
      this.isLoading = false;

    },
    async nextLoad() {
      if (this.last) {
        this.loadData();
      }
    },
  }
};
</script>
