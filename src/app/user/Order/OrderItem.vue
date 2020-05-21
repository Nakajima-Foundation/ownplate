<template>
  <div class="p-t-16 p-l-16 p-r-16">
    <div class="cols">
      <div class="flex-1">
        <div
          class="t-body1 c-text-black-high"
        >{{ item.itemName }} {{count > 1 ? " x " + String(count) : "" }}</div>
        <div
          v-if="specialRequest"
          class="p-l-8 p-r-8 p-t-8 t-caption c-text-black-medium"
        >{{ specialRequest }}</div>
      </div>
      <div class="align-righ">
        <span class="t-body1 c-text-black-high">{{ $n(item.price * count, 'currency') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import store from "~/store/index.js";
import { mapGetters, mapMutations } from "vuex";
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    count: {
      type: Number,
      required: true
    },
    specialRequest: {
      type: String,
      required: false
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
