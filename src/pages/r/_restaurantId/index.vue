<template>
  <span>
    <!-- menu-image -->
    <div id="menu-heder-image">
      <div id="menu-heder-image-mask"></div>
    </div>
    <!-- shop-orner -->
    <section class="section">
      <shop-orner-info
        :src="
              this.shopInfo.restProfilePhoto ||
          'https://pbs.twimg.com/profile_images/704153164438642692/bYo0YeEr_bigger.jpg'
        "
        :name="this.shopInfo.restaurantName || 'Yuta Seatle'"
      ></shop-orner-info>
      <b-tabs size="is-medium" class="block" expanded>
        <b-tab-item :label="$t('sitemenu.menu')">
          <template v-for="menu in menuLists">
            <template v-if="itemsObj[menu]">
              <h2 class="p-big bold" v-if="itemsObj[menu]._dataType === 'title'">
                {{itemsObj[menu].name}}
              </h2>

              <item-card
                v-bind:key="itemsObj[menu].id"
                v-bind:id="itemsObj[menu].id"
                v-bind:counter="orders[itemsObj[menu].id] || 0"
                v-bind:title="itemsObj[menu].itemName"
                v-bind:payment="Number(itemsObj[menu].price||0)"
                v-bind:description="itemsObj[menu].itemDescription"
                v-bind:image="itemsObj[menu].itemPhoto"
                @emitting="emitted($event)"
                v-if="itemsObj[menu]._dataType === 'menu'"
                ></item-card>

            </template>
          </template>


          <hr class="hr-black" />

        </b-tab-item>
        <b-tab-item :label="$t('sitemenu.about')">
          <shop-info v-bind:shopInfo="shopInfo"></shop-info>
        </b-tab-item>
      </b-tabs>
      <button
        v-if="0 != footCounter"
        id="order_btn"
        class="button is-primary is-rounded"
        @click="checkOut"
      >
        <span style="margin-right: auto;">{{$tc('sitemenu.orderCounter', footCounter, {count: footCounter})}}</span>
        <span class="bold" style="margin-left:auto;">{{$t('sitemenu.checkout')}}</span>
      </button>

      <login-modal ref="modalLogin"></login-modal>
    </section>
  </span>
</template>

<script>
import ItemCard from "~/components/ItemCard";
import LoginModal from "~/components/LoginModal";
import ShopOrnerInfo from "~/components/ShopOrnerInfo";
import ShopInfo from "~/components/ShopInfo";

import { db } from "~/plugins/firebase.js";
import { order_status } from "~/plugins/constant.js";

export default {
  name: "ShopMenu",

  components: {
    ItemCard,
    LoginModal,
    ShopOrnerInfo,
    ShopInfo
  },
  data() {
    return {
      orders: {},
      orderId: null,
      footCounter: 0,
      restaurantsId: this.restaurantId(),
      shopInfo: {},
      // isCardModalActive: false
      menus: [],
      titles: [],
      itemsObj: {},

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
        this.menus = menu.docs.map(this.doc2data("menu"));
      }
    });
    const title_detacher = db.collection(`restaurants/${this.restaurantId()}/titles`).onSnapshot((title) => {
      if (!title.empty) {
        this.titles = title.docs.map(this.doc2data("title"));
      }
    });
    this.detacher = [
      restaurant_detacher,
      menu_detacher,
      title_detacher,
    ];
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map((detacher) => {
        detacher();
      });
    }
  },
  watch: {
    footCounter(val) {
      console.log("footCounter" + val);
    },
  },
  computed: {
    menuLists() {
      var list = this.shopInfo.menuLists || [];
      if (Object.keys(this.itemsObj).length !== list.length) {
        const diff = Object.keys(this.itemsObj).filter(itemKey => this.menuLists.indexOf(itemKey) === -1);
        list = list.concat(diff);
      }
      return list;
    }
  },
  mounted() {
    console.log(this.restaurantId());
  },
  methods: {
    emitted(eventArgs) {
      this.orders[eventArgs.id] = eventArgs.counter;
      const orders = this.orders;
      this.footCounter = Object.keys(this.orders).reduce(function(total, id) {
        return total + orders[id]
      }, 0);
    },
    async checkOut() {
      const order_data = {
        order: this.orders,
        status: order_status.new_order,
        uid: "hogehoge", // todo
        // price never set here.
      };
      const res = await db.collection(`restaurants/${this.restaurantId()}/orders`).add(order_data);
      this.orderId = res.id;
      this.$refs.modalLogin.open();
      this.$refs.modalLogin.setOrderId(this.orderId);
    }
  }
};
</script>
<style lang="scss" scoped>
#menu-heder-image {
  background-image: url("https://joooint.com/articles/wp-content/uploads/2019/07/cropped-63837330b62bf983ab70c21bd94128b6_m.jpg");
  width: 100%;
  height: 200px;
  padding: initial !important;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}
// #menu-heder-image-mask {
//   background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), #fff 50%)!important;
// }

#order_btn {
  position: fixed;
  /*基準を画面の左上に*/
  bottom: 1rem;
  /*余白が入らないように*/
  /*以下装飾*/
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  // background: #FFC778;
  color: white;
  height: 3rem;
}
</style>
<style>
.tab-content {
  margin-left: calc(((100vw - 100%) / 2) * -1) !important;
  margin-right: calc(((100vw - 100%) / 2) * -1) !important;
}
</style>
