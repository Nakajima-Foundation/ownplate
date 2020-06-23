<template>
  <section class="section">
    <h2>All Admins</h2>
    <table>
      <tr v-for="admin in admins" :key="admin.id">
        <td>{{admin.name}}</td>
        <td>{{admin.stripe}}</td>
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
        this.admins.forEach(async admin => {
          const payment = (
            await db.doc(`admins/${admin.id}/public/payment`).get()
          ).data();
          if (payment) {
            admin.stripe = payment.stripe || "";
            console.log(admin.stripe);
          }
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  }
};
</script>
