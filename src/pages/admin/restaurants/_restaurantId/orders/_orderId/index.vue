<template>
  <section class="section">
    <back-button :url="'/admin/restaurants/' + restaurantId() + '/orders'" />
    <h2 class="p-big bold">
      #000
    </h2>
    <div style="margin-bottom:1rem">
      <div v-for="orderState in orderStates"
        style="margin:0.2rem" 
        :key="orderState">
        <b-button
          :class="classOf(orderState)"
          style="width:100%"
          @click="changeStatus(orderState)">
          {{ $t("order.status." + orderState) }}
        </b-button>
      </div>
    </div>
    <ordered-item v-for="id in ids" :key="id" :item="item(id)" />
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import OrderedItem from "~/components/OrderedItem";
import { order_status } from "~/plugins/constant.js";

export default {
  components: {
    BackButton,
    OrderedItem
  },

  data() {
    return {
      orderStates: [
        "validation_ok",
        "customer_paid",
        "order_accepted",
        "cooking_completed",
        "customer_picked_up"
      ],
      shopInfo: {},
      menus: {},
      orderInfo: {},
      detacher: [],
    };
  },
  created() {
    const restaurant_detacher = db.doc(`restaurants/${this.restaurantId()}`).onSnapshot((restaurant) => {
      if (restaurant.exists) {
        const restaurant_data = restaurant.data();
        this.shopInfo = restaurant_data;
      }
    });
    const menu_detacher = db.collection(`restaurants/${this.restaurantId()}/menus`).onSnapshot((menu) => {
      if (!menu.empty) {
        const menuList = menu.docs.map(this.doc2data("menu"));
        this.menus = this.array2obj(menuList);
      }
    });
    const order_detacher = db.doc(`restaurants/${this.restaurantId()}/orders/${this.orderId()}`).onSnapshot((order) => {
      if (order.exists) {
        const order_data = order.data();
        this.orderInfo = order_data;
      }
    });
    this.detacher = [
      restaurant_detacher,
      menu_detacher,
      order_detacher
    ];
  },
  destroyed() {
    this.detacher.map((detacher) => {
      detacher();
    });
  },
  computed: {
    ids() {
      return this.orderInfo.order ? Object.keys(this.orderInfo.order) : [];
    },
    count() {
      return this.ids ? this.ids.length : 0;
    }
  },
  methods: {
    item(id) {
      return {
        count: this.orderInfo.order[id],
        menu: this.menus[id]
      }
    },
    changeStatus(statusKey) {
      console.log(order_status[statusKey]);
      const ref = db.doc(`restaurants/${this.restaurantId()}/orders/${this.orderId()}`);
      console.log(this.orderInfo);
      ref.set({status:order_status[statusKey]}, {merge:true});
      //ref.set({})
    },
    classOf(statusKey) {
      if (order_status[statusKey] == this.orderInfo.status) {
        return "validation_ok";
      }
      return "";
    }
  }
};
</script>

<style lang="scss">
.validation_ok {
  color:red;
  background:#ffeeee;
  border: 0;
}
</style>
