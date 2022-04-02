<template>
  <section class="section">
    <back-button :url="backUrl" />
    <h2>All Restaurants</h2>
    <table>
      <tr>
        <td>nama</td>
        <td></td>
        <td>掲載</td>
        <td>公開</td>
        <td>削除</td>
        <td>メニュー数</td>
        <td></td>
        <td>電話通知</td>
      </tr>
      <tr v-for="restaurant in restaurants" :key="restaurant.id">
        <td style="width: 50%">
          <router-link
            :to="`/r/${restaurant.id}`"
            v-if="restaurant.publicFlag && !restaurant.deletedFlag"
          >
            {{ restaurant.restaurantName }}
          </router-link>
          <span v-else>
            {{ restaurant.restaurantName }}
          </span>
        </td>
        <td>
          <router-link :to="`/s/admins/${restaurant.uid}`">管理人</router-link>
        </td>
        <td>
          {{ restaurant.onTheList ? "o" : "-" }}
        </td>
        <td>
          {{ restaurant.publicFlag ? "o" : "-" }}
        </td>
        <td>
          {{ restaurant.deletedFlag ? "o" : "-" }}
        </td>
        <td>
          {{ (restaurant.menuLists || []).length || "-" }}
        </td>
        <td>
          {{ moment(restaurant.createdAt.toDate()).format("YYYY/MM/DD HH:mm") }}
        </td>
        <td>
          {{ !!restaurant.phoneCall ? "o" : "-" }}
        </td>
      </tr>
    </table>
    <hr />
    <b-button
      class="b-reset op-button-pill h-9 rounded-full bg-form m-t-16"
      @click="nextLoad"
    >
      <span class="p-l-16 p-r-16">
        <span class="c-primary t-button"> Next </span>
      </span>
    </b-button>
    <br />

    <b-button
      class="b-reset op-button-pill h-9 rounded-full bg-form m-t-16"
      @click="allLoad"
    >
      <span class="p-l-16 p-r-16">
        <span class="c-primary t-button"> All </span>
      </span>
    </b-button>
    <br />

    <download-csv
      :data="tableData"
      :fields="fields"
      :fieldNames="fieldNames"
      :fileName="fileName"
    >
      <b-button class="b-reset op-button-pill h-9 rounded-full bg-form m-t-16">
        <span class="p-l-16 p-r-16">
          <i class="material-icons c-primary s-18 m-r-8">save_alt</i>
          <span class="c-primary t-button"> Download </span>
        </span>
      </b-button>
    </download-csv>
  </section>
</template>

<script>
// TODO: 通知の状況もわかるようにする
//
import BackButton from "@/components/BackButton";
import { db } from "@/plugins/firebase.js";

import superMixin from "@/mixins/SuperMixin";
import DownloadCsv from "@/components/DownloadCSV";

export default {
  mixins: [superMixin],
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Restaurants"].join(" / "),
    };
  },
  components: {
    BackButton,
    DownloadCsv,
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
  computed: {
    fileName() {
      return "restaurant";
    },
    fields() {
      return [
        "date",
        "restaurantName",
        "state",
        "onTheList",
        "publicFlag",
        "deletedFlag",
        "menu",
        "uid",
      ];
    },
    fieldNames() {
      return this.fields.map((field) => {
        return this.$t(`restaurantCsv.${field}`);
      });
    },
    tableData() {
      return this.restaurants.map((restaurant) => {
        return {
          date: this.moment(restaurant.createdAt.toDate()).format("YYYY/MM/DD"),
          restaurantName: restaurant.restaurantName,
          state: restaurant.state,
          onTheList: restaurant.onTheList ? 1 : 0,
          publicFlag: restaurant.publicFlag ? 1 : 0,
          deletedFlag: restaurant.deletedFlag ? 1 : 0,
          menu: (restaurant.menuLists || []).length || "-",
          uid: restaurant.uid,
        };
      });
    },
  },
  methods: {
    async loadData() {
      if (!this.isLoading) {
        this.isLoading = true;
        let query = db
          .collection("restaurants")
          .orderBy("createdAt", "desc")
          .limit(100);
        if (this.last) {
          query = query.startAfter(this.last);
        }
        const snapshot = await query.get();
        if (!snapshot.empty) {
          this.last = snapshot.docs[snapshot.docs.length - 1];
          snapshot.docs.map(this.doc2data("resuatraut")).forEach((data) => {
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
    async allLoad() {
      while (this.last) {
        await this.loadData();
      }
    },
  },
};
</script>
