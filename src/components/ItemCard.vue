<template>
  <div class="card block" :class="{ order_now: 0 < counter }">
    <div class="card-content">
      <div class="media" @click="openMenuFlag ? closeMenu() : openMenu()">
        <div class="media-content">
          <!-- <h4 class="bold">Kushikatsu Special Platter</h4> -->
          <h4 class="bold">
            {{ title }}
          </h4>
          <h2 class="bold payment">
            {{  $n(payment, 'currency')  }}
          </h2>
          <p>{{ description }}</p>
        </div>
        <div class="media-right">
          <figure class="image is-100x100">
            <img
              class="is-square"
              :src="image"
              alt=""
              style="border-radius: 4px;"
            />
          </figure>
        </div>
      </div>
      <div v-if="openMenuFlag">
        <hr class="hr-black" />
        <div class="count-class">
          <h4>Quantity</h4>

          <div class="level is-mobile counter">
            <div class="level-left">
              <b-button
                v-if="0 < counter"
                class="counter-button disabled"
                rounded
                style="padding-left:2rem;padding-right:2rem;margin-left:1rem;"
                @click="pullCount"
              >
                -
              </b-button>
              <b-button
                v-else
                class="counter-button"
                rounded
                style="padding-left:2rem;padding-right:2rem;margin-left:1rem;"
                disabled
                @click="pullCount"
              >
                -
              </b-button>
            </div>
            <h2
              class="bold"
              style="margin-top:-0.4rem;font-size:3rem!important;color:#0097A7;"
            >
              {{ counter }}
            </h2>
            <div class="level-right">
              <b-button
                class="counter-button"
                rounded
                style="padding-left:2rem;padding-right:2rem;margin-right:1rem;"
                @click="pushCount"
              >
                +
              </b-button>
            </div>
          </div>
          <p class="bold">
            Special instructions
          </p>
          <p class="p-font-mini">
            Please note that special requests may result in price adjustment
            after your order is processed.
          </p>
          <div class="notification">
            <p class="p-font-mini">
              Please put the dressing on the side.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    counter: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    payment: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true,
      default: "https://magazine.hitosara.com/image/421/MM_421.jp"
    }
  },
  data() {
    return {
      openMenuFlag: false
    };
  },
  methods: {
    pullCount() {
      if (this.counter <= 0) {
        return;
      }
      this.order(this.counter - 1);
    },
    pushCount() {
      this.order(this.counter + 1);
    },
    openMenu() {
      this.openMenuFlag = true;
      if (this.counter == 0) {
        this.order(this.counter + 1);
      }
    },
    closeMenu() {
      this.openMenuFlag = false;
    },
    order(newCounter) {
      this.$emit("emitting", { id:this.id, counter:newCounter });
    }
  }
};
</script>
<style lang="scss" scoped>
.card {
  margin-bottom: 0.6rem;
}

.payment {
  margin-top: 0.4rem;
  margin-bottom: 0.4rem;
}

.count-class {
  margin-top: 1rem;
}

.counter {
  margin-top: 1rem;
}

.notification {
  margin-top: 1rem;
}
.order_now {
  background-color: #e0f7fa;
}
</style>
