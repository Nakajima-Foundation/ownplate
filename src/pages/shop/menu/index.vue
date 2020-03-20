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
          'https://pbs.twimg.com/profile_images/704153164438642692/bYo0YeEr_bigger.jpg'
        "
        :name="'Yuta Seatle'"
      ></shop-orner-info>
      <b-tabs size="is-medium" class="block" expanded>
        <b-tab-item label="Menu">
          <h2 class="p-big bold">Most popular</h2>

          <!-- TODO - for -->
          <item-card
            :title="'Kushikatsu Special Platter'"
            :payment="'$26.00'"
            :discription="
              '11 pieces assorted kushikatsu. Served with miso soup and salad.'
            "
            :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"
            @emitting="emitted($event)"
          ></item-card>
          <item-card
            :title="'Spicy Eggplant'"
            :payment="'$8.00'"
            :discription="
              'Steamed topped with assorted fresh roe and special sauce.'
            "
            :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"
            @emitting="emitted($event)"
          ></item-card>
          <item-card
            :title="'Spicy Eggplant'"
            :payment="'$8.00'"
            :discription="
              'Steamed topped with assorted fresh roe and special sauce.'
            "
            :image="
              'https://www.momoya.co.jp/wp-content/uploads/2016/01/%E6%B8%88%EF%BC%97.jpg'
            "
            @emitting="emitted($event)"
          ></item-card>

          <hr class="hr-black" />

          <h2 class="p-big bold">Appetizers</h2>
          <!-- TODO - for -->
          <item-card
            :title="'Kushikatsu Special Platter'"
            :payment="'$26.00'"
            :discription="
              '11 pieces assorted kushikatsu. Served with miso soup and salad.'
            "
            :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"
            @emitting="emitted($event)"
          ></item-card>
          <item-card
            :title="'Spicy Eggplant'"
            :payment="'$8.00'"
            :discription="
              'Steamed topped with assorted fresh roe and special sauce.'
            "
            :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"
            @emitting="emitted($event)"
          ></item-card>
          <item-card
            :title="'Spicy Eggplant'"
            :payment="'$8.00'"
            :discription="
              'Steamed topped with assorted fresh roe and special sauce.'
            "
            :image="
              'https://www.momoya.co.jp/wp-content/uploads/2016/01/%E6%B8%88%EF%BC%97.jpg'
            "
            @emitting="emitted($event)"
          ></item-card>
          <item-card
            :title="'Chicken Karaage'"
            :payment="'$9.95'"
            :discription="'Chicken Karaage'"
            @emitting="emitted($event)"
          ></item-card>
          <item-card
            :title="'Edamame'"
            :payment="'$3.00'"
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
        <span style="margin-right: auto;">{{ footCounter }} item</span>
        <span class="bold" style="margin-left:auto;">CHECKOUT</span>
      </button>

      <login-modal ref="modalLogin"></login-modal>
    </section>
  </span>
</template>

<script>
import store from "~/store/index.js";
import ItemCard from "~/components/ItemCard";
import LoginModal from "~/components/LoginModal";
import ShopOrnerInfo from "~/components/ShopOrnerInfo";
import ShopInfo from "~/components/ShopInfo";

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
      footCounter: this.$store.state.totalOrderCount
      // isCardModalActive: false
    };
  },
  watch: {
    footCounter(val) {
      console.log("footCounter" + val);
    }
  },
  mounted() {
    console.log(this.$store.state.totalOrderCount);
  },
  methods: {
    emitted(eventArgs) {
      this.footCounter = eventArgs.orderCount;
      // console.log(eventArgs.orderCount);
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
