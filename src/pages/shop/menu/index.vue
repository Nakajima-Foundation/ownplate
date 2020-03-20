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
          <figure class="image is-64x64">
            <img
              class="is-rounded"
              src="https://pbs.twimg.com/profile_images/704153164438642692/bYo0YeEr_bigger.jpg"
              alt=""
            />
          </figure>
        </div>
        <div class="media-content">
          <h3 class="title is-4">Yuta Seatle</h3>
        </div>
      </div>

      <!-- shop-orner -->
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
          <h2 class="bold">Adress</h2>
          <a
            target="_blank"
            href="https://goo.gl/maps/g1ocnE21MTvbeTaV7"
            class="p-font-middle"
          >
            <i class="fas fa-map-marker-alt" style="margin-right:1rem;"></i>
            5401 20th Ave NW, Seattle, WA 98107
          </a>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d10747.343129628855!2d-122.3823014!3d47.6681865!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x77579f8814f54e37!2sArashi%20Ramen!5e0!3m2!1sja!2sjp!4v1584711520886!5m2!1sja!2sjp"
            height="450"
            frameborder="0"
            style="border:0;"
            allowfullscreen=""
            aria-hidden="false"
            tabindex="0"
          ></iframe>

          <h2 class="bold">Phones Number</h2>
          <div class="notification is-centered">
            <a>
              <p class="p-font bold" style="text-align:center;">
                +1 206-492-7933
              </p>
            </a>
          </div>
          <h2 class="bold">Website</h2>
          <div class="notification">
            <div
              class="is-centered"
              style="margin-left: 2rem;margin-right: 2rem;"
            >
              <a target="_blank" href="https://www.arashiramen.com/">
                https://www.arashiramen.com/
              </a>
            </div>
          </div>
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

export default {
  name: "ShopMenu",

  components: {
    ItemCard,
    LoginModal
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
    cardModal() {
      this.$buefy.modal.open({
        parent: this,
        component: ModalForm,
        hasModalCard: true,
        customClass: "custom-class custom-class-2",
        trapFocus: true
      });
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
  color: white;
}
</style>
<style>
.tab-content {
  margin-left: calc(((100vw - 100%) / 2) * -1) !important;
  margin-right: calc(((100vw - 100%) / 2) * -1) !important;
}
</style>
