<template>
  <!-- <div class="card block"> -->
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <h4 class="bold">
          {{ title }}
        </h4>
        <p v-if="option" class="p-font-mini payment">
          {{ option }}
        </p>
        <p v-if="optionPayment" class="p-font-mini payment">
          {{ optionPayment }}
        </p>
      </div>
      <div class="media-right" style="margin-top:-0.4rem;">
        <p class="p-bold">
          {{ payment }}
        </p>
      </div>
    </div>
  </div>
  <!-- </div> -->
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
    optionPayment: {
      type: String,
      required: true
    },
    option: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      counter: 0,
      openMenuFlag: false
    };
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.card {
  margin-bottom: 0.6rem;
}
</style>
