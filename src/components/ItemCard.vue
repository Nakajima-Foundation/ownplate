<template>
  <div class="card block" :class="{order_now:0 < counter}">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <!-- <h4 class="bold">Kushikatsu Special Platter</h4> -->
          <h4 class="bold">{{title}}</h4>
          <h2 class="bold payment">{{payment}}</h2>
          <p>{{discription}}</p>
        </div>
        <div class="media-right">
          <figure class="image is-100x100"><img class="is-square" :src="image" alt=""></figure>
        </div>
      </div>
      <div class="level is-mobile">
        <div class="level-left">
        </div>
        <div class="level-right">
          <b-button  icon-left="cart" v-if="!this.openMenuFlag" @click="openMenu" style="margin-right:auto" type="is-info" class="counter-button" rounded>Order</b-button>
          <b-button icon-left="close" v-else-if="this.openMenuFlag" @click="closeMenu" style="margin-right:auto" class="counter-button" rounded>Close</b-button>
        </div>
      </div>
      <div v-if="openMenuFlag">
        <hr class="hr-black" />
        <div class="count-class">
          <h4>Quantity</h4>

          <div class="level is-mobile counter">
            <div class="level-left">
              <b-button v-if="0 < counter" @click="pullCount" class="counter-button disabled" rounded style="padding-left:2rem;padding-right:2rem;margin-left:1rem;">-</b-button>
              <b-button disabled v-else @click="pullCount" class="counter-button" rounded style="padding-left:2rem;padding-right:2rem;margin-left:1rem;" disabled>-</b-button>
            </div>
            <h2 style="margin-top:-0.4rem;">{{counter}}</h2>
            <div class="level-right">
              <b-button @click="pushCount" class="counter-button" rounded style="padding-left:2rem;padding-right:2rem;margin-right:1rem;">+</b-button>
            </div>
          </div>
          <p class="bold">Special instructions</p>
          <p class="p-font-mini">Please note that special requests may result in price adjustment after your order is processed.</p>
          <div class="notification">
            <p class="p-font-mini">Please put the dressing on the side.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from "~/store/index.js";
import { mapGetters, mapMutations } from "vuex";
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    payment: {
      type: String,
      required: true
    },
    discription: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true,
      default: "https://magazine.hitosara.com/image/421/MM_421.jp"
    },
  },
  data() {
    return {
      counter: 0,
      openMenuFlag:false
    }
  },
  methods:{
    pullCount(){
      if(this.counter <= 0){
        return;
      }
      this.counter --;
        this.$store.state.totalOrderCount--;
        this.order();
        console.log(this.$store.state.totalOrderCount);
    },
    pushCount(){
      this.counter ++;
      this.$store.state.totalOrderCount++;
      this.order();
      console.log(this.$store.state.totalOrderCount);
    },
    openMenu() {
      this.openMenuFlag = true;
      if(this.counter == 0){
        this.counter ++;
        this.$store.state.totalOrderCount++;
        this.order();
        console.log(this.$store.state.totalOrderCount);
      }
    },
    closeMenu() {
      this.openMenuFlag = false;
    },
    order(){
      this.$emit('emitting', {orderCount: this.$store.state.totalOrderCount})
    }
  }
};
</script>
<style lang="scss" scoped>
.card {
  margin-bottom:0.6rem;
}

.payment {
  margin-top:0.4rem;
  margin-bottom:0.4rem;
}

.count-class {
  margin-top:1rem;
}

.counter {
   margin-top:1rem;
}

.notification {
  margin-top:1rem;
}
.order_now {
  background-color:#C2EEFF;
}
</style>
