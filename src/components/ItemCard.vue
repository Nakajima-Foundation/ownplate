<template>
  <div class="card block" :style="cardStyle">
    <div class="card-content">
      <div class="media" @click="openMenuFlag ? closeMenu() : openMenu()">
        <div class="media-content">
          <!-- <h4 class="bold">Kushikatsu Special Platter</h4> -->
          <p class="item-name">{{ title }}</p>
          <p class="item-price">{{ $n(price, 'currency') }}</p>
          <p>{{ description }}</p>
        </div>
        <div class="media-right">
          <figure class="image is-100x100">
            <img class="is-square" :src="image" alt style="border-radius: 4px;" />
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
                class="counter-button"
                rounded
                style="padding-left:2rem;padding-right:2rem;margin-left:1rem;"
                :disabled="counter === 0"
                @click="pullCount"
              >
                <i class="fas fa-minus" />
              </b-button>
            </div>
            <span class="item-counter">{{ counter }}</span>
            <div class="level-right">
              <b-button
                class="counter-button"
                rounded
                style="padding-left:2rem;padding-right:2rem;margin-right:1rem;"
                @click="pushCount"
              >
                <i class="fas fa-plus" />
              </b-button>
            </div>
          </div>
          <div v-if="hasOptions">
            <div v-for="(option, index) in options" :key="index">
              <div v-if="option.length === 1" class="field">
                <b-checkbox v-model="optionValues[index]">{{ option[0] }}</b-checkbox>
              </div>
              <div v-else class="field">
                <b-radio
                  v-for="(choice, index2) in option"
                  v-model="optionValues[index]"
                  name="key + index"
                  :native-value="choice"
                  :key="index2"
                >{{ choice }}</b-radio>
              </div>
            </div>
          </div>
          <div v-if="false">
            <p class="bold">Special instructions</p>
            <p class="p-font-mini">
              Please note that special requests may result in price adjustment
              after your order is processed.
            </p>
            <div class="notification">
              <p class="p-font-mini">Please put the dressing on the side.</p>
            </div>
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
    item: {
      type: Object,
      required: true
    },
    counter: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      openMenuFlag: false,
      optionValues: []
    };
  },
  created() {
    this.optionValues = this.options.map(option => {
      return option.length === 1 ? false : option[0];
    });
  },
  watch: {
    // Only for debugging
    optionValues() {
      console.log(this.optionValues);
    }
  },
  computed: {
    options() {
      return (this.item.itemOptionCheckbox || []).map(option => {
        return option.split(",").map(choice => {
          return choice.trim();
        });
      });
    },
    hasOptions() {
      return this.options.length;
    },
    cardStyle() {
      return this.counter > 0 ? { backgroundColor: "#e0f7fa" } : {};
    },
    price() {
      return Number(this.item.price || 0);
    },
    image() {
      // BUGBUG: Come up with a better default image.
      return (
        this.item.itemPhoto ||
        "https://magazine.hitosara.com/image/421/MM_421.jp"
      );
    },
    title() {
      return this.item.itemName;
    },
    description() {
      return this.item.itemDescription;
    }
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
      this.$emit("didCountChange", { id: this.item.id, counter: newCounter });
    }
  }
};
</script>
<style lang="scss" scoped>
.card {
  margin-bottom: 0.6rem;
}

.item-counter {
  margin-top: -0.4rem;
  font-size: 3rem !important;
  color: $primary;
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
</style>
