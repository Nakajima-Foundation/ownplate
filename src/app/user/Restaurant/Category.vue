<template>
<div>
  <div>CATEGORY</div>
  <div v-for="(cat, k) in categoryData" :key="k">
    {{cat.name}} <img src="/android-chrome-192x192.png" class="w-12" />
  </div>
</div>
</template>

<script>
import {
  defineComponent,
} from "@vue/composition-api";

export default defineComponent({
  props: {
    categoryData: {
      type: Array,
      required: true,
    },
  },
  setup(props, ctx) {
    return {};
  }  
});
</script>
