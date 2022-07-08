<template>
<div>
  <div>CATEGORY</div>
  <div v-for="(cat, k) in categoryData" :key="k">
    <div>
      <router-link :to="basePath + '/r/' + restaurantId() + '/cat/' + cat.id + '/' + cat.subcategory">
        <span>{{cat.name}}</span>
        <img src="/android-chrome-192x192.png" class="w-12" />
      </router-link>
    </div>
  </div>
</div>
</template>

<script>
import {
  defineComponent,
  computed,
} from "@vue/composition-api";
import { useBasePath } from "@/utils/utils";

export default defineComponent({
  props: {
    categoryData: {
      type: Array,
      required: true,
    },
  },
  setup(props, ctx) {
    const basePath = useBasePath(ctx.root);

    return {
      basePath,
    };
  }  
});
</script>
