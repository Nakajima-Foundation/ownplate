<template>
  <section class="section">
    <h2>All Admins</h2>
    <table>
      <tr v-for="admin in admins" :key="admin.id">
        <td>{{admin.name}}</td>
      </tr>
    </table>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      admins: [],
      detacher: null
    };
  },
  created() {
    this.detacher = db
      .collection("admins")
      .limit(100)
      .onSnapshot(snapshot => {
        this.admins = snapshot.docs.map(this.doc2data("admin"));
        console.log(this.admins);
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  }
};
</script>
