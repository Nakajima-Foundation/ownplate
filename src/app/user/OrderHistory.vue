<template>
  <div>
    <!-- History Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Back Button and Restaurant Profile -->
          <div>
            <!-- Back Button -->
            <back-button url="/u/profile/" class="m-t-24" />
            <!-- Title -->
            <div class="t-h6 c-text-black-disabled m-t-24">{{$t('order.history')}}</div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- History Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-16 m-t-24">
          <!-- Orders -->
          <div class="columns is-gapless is-multiline">
            <ordered-info
              v-for="order in orders"
              :key="order.id"
              @selected="orderSelected($event)"
              :order="order"
            />
          </div>

          <!-- Phone Login-->
          <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
            <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
              <phone-login v-on:dismissed="handleDismissed" />
            </div>
          </b-modal>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";
import PhoneLogin from "~/app/auth/PhoneLogin";
import BackButton from "~/components/BackButton";

export default {
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
      return this.$store.getters.uidUser;
    }
  },
  methods: {
    getHistory() {
      this.detatcher && this.detatcher();
      if (this.uid) {
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
      this.$router.push({
        path: "/r/" + order.restaurantId + "/order/" + order.id
      });
    }
  }
};
</script>
