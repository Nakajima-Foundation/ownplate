<template>
  <section class="section">
    <h2>{{$t('order.history')}}</h2>
    <ordered-info
      v-for="order in orders"
      :key="order.id"
      @selected="orderSelected($event)"
      :order="order"
    />
    <b-modal :active.sync="loginVisible" :width="640">
      <div class="card">
        <div class="card-content">
          <phone-login v-on:dismissed="handleDismissed" />
        </div>
      </div>
    </b-modal>
  </section>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";
import PhoneLogin from "~/app/auth/PhoneLogin";

export default {
  components: {
    OrderedInfo,
    PhoneLogin
  },
  data() {
    return {
      loginVisible: false,
      detatcher: () => {},
      orders: []
    };
  },
  async created() {
    console.log("created", this.uid);
    this.loginVisible = !this.uid;
    this.getHistory();
  },
  destroyed() {
    this.detatcher();
  },
  watch: {
    uid(newValue) {
      this.getHistory();
    }
  },
  computed: {
    uid() {
      return this.$store.getters.uidUser;
    }
  },
  methods: {
    getHistory() {
      if (this.uid) {
        this.detatcher();
        this.detatcher = db
          .collectionGroup("orders")
          .where("uid", "==", this.uid)
          .orderBy("timePlaced", "desc")
          .limit(25)
          .onSnapshot(snapshot => {
            this.orders = snapshot.docs.map(doc => {
              const order = doc.data();
              order.restaurantId = doc.ref.path.split("/")[1];
              order.id = doc.id;
              // HACK: Remove it later
              order.timePlaced =
                (order.timePlaced && order.timePlaced.toDate()) || new Date();
              return order;
            });
          });
      }
    },
    handleDismissed(success) {
      console.log("handleDismissed", success);
      if (success) {
        this.loginVisible = false;
      } else {
        this.$router.push("/");
      }
    },
    orderSelected(order) {
      this.$router.push({
        path: "/r/" + order.restaurantId + "/order/" + order.id
      });
    }
  }
};
</script>
