<template>
  <span>
    <!-- menu-image -->
    <div id="menu-heder-image">
      <div id="menu-heder-image-mask"></div>
    </div>
    <section class="section">

      <!-- shop-orner -->
      <div class="media">
        <div class="media-left">
          <figure class="image is-64x64"><img class="is-rounded" src="https://pbs.twimg.com/profile_images/704153164438642692/bYo0YeEr_bigger.jpg" alt=""></figure>
        </div>
        <div class="media-content">
          <h3 class="title is-4">Yuta Seatle</h3>
        </div>
      </div>

      <!-- shop-orner -->
      <b-tabs size="is-medium" class="block" expanded>
        <b-tab-item label="Menu">
          <h2 class="p-big bold">Most popular</h2>
          <item-card @emitting='emitted($event)' :title="'Kushikatsu Special Platter'" :payment="'$26.00'" :discription="'11 pieces assorted kushikatsu. Served with miso soup and salad.'" :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"></item-card>
          <item-card @emitting='emitted($event)' :title="'Spicy Eggplant'" :payment="'$8.00'" :discription="'Steamed topped with assorted fresh roe and special sauce.'" :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"></item-card>
          <item-card @emitting='emitted($event)' :title="'Spicy Eggplant'" :payment="'$8.00'" :discription="'Steamed topped with assorted fresh roe and special sauce.'" :image="'https://www.momoya.co.jp/wp-content/uploads/2016/01/%E6%B8%88%EF%BC%97.jpg'"></item-card>

          <hr class="hr-black" />

          <h2 class="p-big bold">Appetizers</h2>
          <item-card @emitting='emitted($event)' :title="'Kushikatsu Special Platter'" :payment="'$26.00'" :discription="'11 pieces assorted kushikatsu. Served with miso soup and salad.'" :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"></item-card>
          <item-card @emitting='emitted($event)' :title="'Spicy Eggplant'" :payment="'$8.00'" :discription="'Steamed topped with assorted fresh roe and special sauce.'" :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"></item-card>
          <item-card @emitting='emitted($event)' :title="'Spicy Eggplant'" :payment="'$8.00'" :discription="'Steamed topped with assorted fresh roe and special sauce.'" :image="'https://www.momoya.co.jp/wp-content/uploads/2016/01/%E6%B8%88%EF%BC%97.jpg'"></item-card>
          <item-card @emitting='emitted($event)' :title="'Chicken Karaage'" :payment="'$9.95'" :discription="'Chicken Karaage'"></item-card>
          <item-card @emitting='emitted($event)' :title="'Edamame'" :payment="'$3.00'"></item-card>

        </b-tab-item>
        <b-tab-item label="About">
          huga
        </b-tab-item>
      </b-tabs>
      <button id="order_btn" class="button is-info is-rounded" v-if="0 != footCounter">
        <span style="margin-right: auto;">{{footCounter}} item</span>
        <span class="bold" style="margin-left:auto;">CHECKOUT</span>
      </button>
    </section>
  </span>
</template>

<script>
import store from "~/store/index.js";
import ItemCard from "~/components/ItemCard";
export default {
  name: 'ShopMenu',

  components: {
    ItemCard
  },
  watch:{
    footCounter(val) {
      console.log('footCounter'+val);
    }
  },
  data () {
    return {
      footCounter: this.$store.state.totalOrderCount,
    }
  },
  methods:{
    emitted (eventArgs) {
      this.footCounter = eventArgs.orderCount;
      // console.log(eventArgs.orderCount);
    }
  },
  mounted() {
    console.log(this.$store.state.totalOrderCount);
  }
}
</script>
<style lang="scss" scoped>
#menu-heder-image{
  background-image: url('https://joooint.com/articles/wp-content/uploads/2019/07/cropped-63837330b62bf983ab70c21bd94128b6_m.jpg');
  width: 100%;
  height: 200px;
  padding: initial!important;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}
// #menu-heder-image-mask {
//   background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), #fff 50%)!important;
// }

.media-content {
  margin-top: auto;
  margin-bottom: auto;
}

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
  color:white;
}

</style>
<style>
.tab-content {
  margin-left: calc(((100vw - 100%) / 2) * -1)!important;
  margin-right: calc(((100vw - 100%) / 2) * -1)!important;
}
</style>
