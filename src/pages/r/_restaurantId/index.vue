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
        <b-tab-item label="Menu">
          <h2 class="p-big bold">Appetizers</h2>

          <item-card
            v-for="item in appetizers"
            v-bind:key="item.id"
            v-bind:id="item.id"
            v-bind:counter="orders[item.id] || 0"
            v-bind:title="item.title"
            v-bind:payment="item.payment"
            v-bind:description="item.description"
            v-bind:image="item.image"
            @emitting="emitted($event)"
          ></item-card>

          <hr class="hr-black" />

          <h2 class="p-big bold">Entrees</h2>
          <item-card
            v-for="item in entrees"
            v-bind:key="item.id"
            v-bind:id="item.id"
            v-bind:counter="orders[item.id] || 0"
            v-bind:title="item.itemName"
            v-bind:payment="Number(item.price||0)"
            v-bind:description="item.itemDescription"
            v-bind:image="item.itemPhoto"
            @emitting="emitted($event)"
          ></item-card>

        </b-tab-item>
        <b-tab-item label="About">
          <shop-info></shop-info>
        </b-tab-item>
      </b-tabs>
      <button
        v-if="0 != footCounter"
        id="order_btn"
        class="button is-info is-rounded"
        @click="checkOut"
      >
        <span style="margin-right: auto;">{{ footCounter }} {{ footCounter > 1 ? "items": "item"}}</span>
        <span class="bold" style="margin-left:auto;">CHECKOUT</span>
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
      entrees: [{
        id:"1001",
        title:"Kushikatsu Special Platter",
        payment:"$26.00",
        description:"11 pieces assorted kushikatsu. Served with miso soup and salad.",
        image:"https://magazine.hitosara.com/image/421/MM_421.jpg",
      },{
        id:"1002",
        title:"Spicy Eggplant",
        payment:"$8.00",
        description:"Steamed topped with assorted fresh roe and special sauce.",
        image:"https://demandafrica-4741.kxcdn.com/wp-content/uploads/2017/08/Spicy-Chinese-Eggplant.jpg"
      },{
        id:"1003",
        title:"Oyako-don",
        payment:"$8.00",
        description:"Chiken and Egg on Rice.",
        image:"https://www.momoya.co.jp/wp-content/uploads/2016/01/%E6%B8%88%EF%BC%97.jpg"
      }],
      appetizers: [{
        id:"1004",
        title:"Chicken Karaage",
        payment:"$9.95",
        description:"Chicken Karaage",
        image:"https://img.cpcdn.com/recipes/4417485/280x487s/e4e40823fa78ca87df83284c5ecc5cf2.jpg"
      },{
        id:"1005",
        title:"Edamame",
        payment:"$3.00",
        description:"Boiled Soy Beans",
        image:"https://www.olive-hitomawashi.com/column/assets_c/2017/12/SEO058K_0-thumb-500xauto-50342.jpg",
      }],
      orders: {},
      footCounter: 0,
      restaurantsId: this.restaurantId(),
      shopInfo: {},
      // isCardModalActive: false
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
        this.entrees = [];
        menu.docs.map((doc) => {
          const data = doc.data();
          data.id = doc.id;
          this.entrees.push(data);
        });
      }
    });
    this.detacher = [
      restaurant_detacher,
      menu_detacher
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
  mounted() {
    console.log(this.restaurantId());
  },
  methods: {
    restaurantId() {
      return this.$route.params.restaurantId;
    },
    emitted(eventArgs) {
      this.orders[eventArgs.id] = eventArgs.counter;
      const orders = this.orders;
      this.footCounter = Object.keys(this.orders).reduce(function(total, id) {
        return total + orders[id]
      }, 0);
    },
    checkOut() {
      this.$refs.modalLogin.open();
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
