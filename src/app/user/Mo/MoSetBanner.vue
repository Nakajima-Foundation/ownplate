<template>
  <div class="text-center">
    <router-link :to="pageBase + '/page/202303spring'">
      <img src="https://mo-data-dev.omochikaeri.com/images/assets/logo_vertical.png" class="w-2/3" id="springBanner" />
    </router-link>
  </div>
</template>

<script>
import {
  defineComponent,
} from "@vue/composition-api";
export default defineComponent({
  props: {
    pageBase: {
      type: String,
      required: false,
    },
  }
});
</script>


