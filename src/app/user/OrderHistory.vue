<template>
  <div>
    <!-- Back -->
    <div class="mt-6 mx-6">
      <back-button :url="inLiff ? liff_base_path : '/u/profile/'" />
    </div>

    <!-- Title -->
    <div class="mt-6 mx-6 text-xl font-bold text-black text-opacity-30">
      {{ $t("order.history") }}
    </div>

    <!-- Orders -->
    <div class="mx-6 mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4">
      <ordered-info
        v-for="order in orders"
        :key="order.id"
        @selected="orderSelected($event)"
        :order="order"
        :isSuperView="true"
      />
    </div>

    <!-- Phone Login-->
    <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
      <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
        <phone-login v-on:dismissed="handleDismissed" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";
import PhoneLogin from "~/app/auth/PhoneLogin";
import BackButton from "~/components/BackButton";

export default {
  head() {
    return {
      title: [this.defaultTitle, "User Order History"].join(" / ")
    }
  },
  components: {
    OrderedInfo,
    PhoneLogin,
    BackButton
  },
  data() {
    return {
      loginVisible: false,
      detatcher: null,
      orders: []
    };
  },
  async created() {
    //console.log("created", this.uid);
    this.loginVisible = !this.uid;
    this.getHistory();
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
  watch: {
    uid(newValue) {
      this.getHistory();
    }
  },
  computed: {
    uid() {
      return this.$store.getters.uidUser || this.$store.getters.uidLiff;
    }
  },
  methods: {
    getHistory() {
      this.detatcher && this.detatcher();
      if (this.uid) {
        this.detatcher = db
          .collectionGroup("orders")
          .where("uid", "==", this.uid)
          .orderBy("orderPlacedAt", "desc")
          .limit(200)
          .onSnapshot(snapshot => {
            this.orders = snapshot.docs.map(doc => {
              const order = doc.data();
              order.restaurantId = doc.ref.path.split("/")[1];
              order.id = doc.id;
              // HACK: Remove it later
              order.timePlaced =
                (order.timePlaced && order.timePlaced.toDate()) || new Date();
              new Date();
              if (order.timeEstimated) {
                order.timeEstimated = order.timeEstimated.toDate();
              }
              return order;
            });
          });
      } else {
        this.detatcher = null;
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
      if (this.inLiff) {
        this.$router.push({
          path: this.liff_base_path + "/r/" + order.restaurantId + "/order/" + order.id
        });
      } else {
        this.$router.push({
          path: "/r/" + order.restaurantId + "/order/" + order.id
        });
      }
    }
  }
};
</script>
