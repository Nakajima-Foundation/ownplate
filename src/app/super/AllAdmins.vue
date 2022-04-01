<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Admins</h2>
    <table>
      <tr>
        <th>Name</th>
        <th>e-mail</th>
        <th>Created</th>
        <th>A</th>
        <th>O</th>
        <th>Stripe</th>
        <th>JCB</th>
      </tr>

      <tr v-for="admin in admins" :key="admin.id">
        <td style="padding-right:8px">
          <router-link :to="`/s/admins/${admin.id}`">{{admin.name || "(no name)"}}</router-link>
        </td>
        <td style="padding-right:8px">{{profile(admin).email}}</td>
        <td style="padding-right:8px">{{moment(admin.created.toDate()).format("YYYY/MM/DD HH:mm")}}</td>
        <td style="padding-right:8px">{{admin.admin ? "A" : ""}}</td>
        <td style="padding-right:8px">{{admin.operator ? "O" : ""}}</td>
        <td
          v-if="payment(admin).verified === false"
          style="color:red;padding-right:8px"
        >{{payment(admin).stripe}}</td>
        <td style="padding-right:8px" v-else>{{payment(admin).stripe}}</td>
        <td style="padding-right:8px">
          {{capabilities(admin).jcb_payments}}
          <b-button v-if="showActivate(admin)" @click="activate(admin)">Activate</b-button>
        </td>
      </tr>
    </table>
    <div>
      <b-button @click="updateQuery">
        <span v-if="last">Next</span>
        <span v-else>Top</span>
      </b-button>
    </div>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import { stripeVerify } from "~/plugins/stripe.js";

import superMixin from "./SuperMixin";

const QUERY_LIMIT = 50;

export default {
  mixins: [superMixin],
  components: {
    BackButton
  },
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Admin"].join(" / ")
    }
  },
  data() {
    return {
      admins: [],
      infos: {},
      last: null,
      detacher: null
    };
  },
  async mounted() {
    this.superPermissionCheck();
  },
  created() {
    this.updateQuery();
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  methods: {
    updateQuery() {
      this.detacher && this.detacher();
      let query = db.collection("admins").orderBy("created", "desc");
      if (this.last) {
        query = query.startAfter(this.last);
      }
      this.detacher = query.limit(QUERY_LIMIT).onSnapshot(snapshot => {
        if (snapshot.docs.length === QUERY_LIMIT) {
          this.last = snapshot.docs[QUERY_LIMIT - 1];
        } else {
          this.last = null;
        }
        const admins = snapshot.docs.map(this.doc2data("admin"));
        admins.forEach(async admin => {
          this.admins.push(admin);
          // NOTE: We are getting extra data only once for each admin
          if (!this.infos[admin.id]) {
            this.updateInfo(admin);
          }
        });
      });
    },
    async updateInfo(admin) {
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
    },
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
    },
    showActivate(admin) {
      return (
        this.capabilities(admin).jcb_payments === "active" &&
        !this.payment(admin).stripeJCB
      );
    },
    async activate(admin) {
      await db.doc(`admins/${admin.id}/public/payment`).update({
        stripeJCB: true
      });
      this.updateInfo(admin);
    }
  }
};
</script>
