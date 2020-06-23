<template>
  <section class="section">
    <h2>All Admins</h2>
    <table>
      <tr v-for="admin in admins" :key="admin.id">
        <td>{{admin.name}}</td>
        <td>{{payment(admin).stripe}}</td>
        <td>{{payment(admin).verified}}</td>
        <td>{{profile(admin).email}}</td>
      </tr>
    </table>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import { stripeVerify } from "~/plugins/stripe.js";

export default {
  data() {
    return {
      admins: [],
      infos: {},
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
          // NOTE: We are getting extra data only once for each admin
          if (!this.infos[admin.id]) {
            const info = {};
            const payment = (
              await db.doc(`admins/${admin.id}/public/payment`).get()
            ).data();
            if (payment?.stripe) {
              const { data } = await stripeVerify({
                account_id: payment?.stripe
              });
              console.log("data", payment?.stripe, data);
              payment.verified = data.result;
            }
            info.payment = payment || {};
            const profile = (
              await db.doc(`admins/${admin.id}/private/profile`).get()
            ).data();
            info.profile = profile || {};
            this.infos[admin.id] = info;
            this.infos = Object.assign({}, this.infos);
          }
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
  methods: {
    profile(admin) {
      return this.infos[admin.id]?.profile || {};
    },
    payment(admin) {
      return this.infos[admin.id]?.payment || {};
    }
  }
};
</script>
