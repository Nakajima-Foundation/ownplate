<template>
  <div
    class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-opacity-5 px-4"
    :class="positive ? 'bg-black' : 'bg-red-700'"
  >
    <i class="material-icons text-l mr-2 text-red-700">remove_shopping_cart</i>
    <div
      class="font-bold"
      :class="positive ? 'text-sm text-red-700' : 'text-xs text-red-700'"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from "vue";
export default defineComponent({
  props: {
    positive: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
