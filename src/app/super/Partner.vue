<template>
  <section class="section">
    <back-button url="/s" />

    <div v-for="(admin, k) in admins">
      {{admin.name}} {{admin.partners}} {{admin.created.toDate()}}
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
      return admin.data();
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
