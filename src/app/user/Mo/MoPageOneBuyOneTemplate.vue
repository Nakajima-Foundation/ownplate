<template>
  <div>
    <div>
      <div class="flex w-full justify-center mb-3 sm:mb-6">
        <img
          :src="buySrc"
          class="rounded-lg object-cover"
          />
			</div>
      <slot name="header"></slot>
    </div>
    <slot name="menu"></slot>
    <div>
      <div class="flex w-full justify-center mt-3 sm:mt-6">
        <img
          :src="getSrc"
          class="rounded-lg object-cover"
          />
			</div>
      <slot name="footer"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
export default defineComponent({
  props: {
    buySrc: {
      type: Object,
      required: true,
    },
    getSrc: {
      type: Object,
      required: true,
    },

  }
});
</script>
