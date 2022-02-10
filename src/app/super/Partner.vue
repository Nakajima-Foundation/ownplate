<template>
  <section class="section">
    <back-button url="/s" />

    <div v-for="(admin, k) in admins">
      <nuxt-link :to="`/s/admins/${admin.id}`">{{admin.name}}</nuxt-link> {{admin.partners}} {{admin.created.toDate()}}
    </div>

  </section>
</template>

<script>

import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";

import superMixin from "./SuperMixin";

export default {
  mixins: [superMixin],
  components: {
    BackButton
  },
  head() {
    return {
      title: [this.defaultTitle, "Super Partners"].join(" / ")
    }
  },
  async created() {
    const adminCollections = await db.collection("admins").where("partners", "!=", null).limit(200).get();
    this.admins = adminCollections.docs.map(admin => {
      const data = admin.data();
      data.id = admin.id
      return data;
    }).sort((a, b) => {
      return a.created.toDate().getTime() < b.created.toDate().getTime() ? 1: -1;
    });
    console.log(this.admins);
  },
  async mounted() {
    this.superPermissionCheck();
  },
  data() {
    return {
      admins: [],
    };
  }
}
</script>
