<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Admins</h2>
    <table>
      <tr>
        <th>Name</th>
        <th>e-mail</th>
        <th>Stripe</th>
        <th>JCB</th>
      </tr>

      <tr v-for="admin in admins" :key="admin.id">
        <td style="padding-right:8px">
          <nuxt-link :to="`/s/admins/${admin.id}`">{{admin.name || "(no name)"}}</nuxt-link>
        </td>
        <td style="padding-right:8px">{{profile(admin).email}}</td>
        <td
          v-if="payment(admin).verified === false"
          style="color:red;padding-right:8px"
        >{{payment(admin).stripe}}</td>
        <td style="padding-right:8px" v-else>{{payment(admin).stripe}}</td>
        <td style="padding-right:8px">{{capabilities(admin).jcb_payments}}</td>
      </tr>
    </table>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import { stripeVerify } from "~/plugins/stripe.js";

export default {
  components: {
    BackButton
  },
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
        this.admins.forEach(async admin => {
          // NOTE: We are getting extra data only once for each admin
          if (!this.infos[admin.id]) {
            const info = {};
            const payment = (
              await db.doc(`admins/${admin.id}/public/payment`).get()
            ).data();
            if (payment?.stripe) {
              try {
                const { data } = await stripeVerify({
                  account_id: payment?.stripe
                });
                console.log("data", payment?.stripe, data);
                payment.verified = data.result;
                if (data.account) {
                  info.account = data.account;
                }
              } catch (error) {
                console.error(error.message);
                payment.verified = false;
              }
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
    },
    account(admin) {
      return this.infos[admin.id]?.account || {};
    },
    capabilities(admin) {
      return this.account(admin)?.capabilities || {};
    }
  }
};
</script>
