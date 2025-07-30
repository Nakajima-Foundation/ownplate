<template>
  <div
    v-if="orderState === 'order_placed'"
    class="rounded bg-yellow-500/10 px-3 py-1 text-yellow-500 transition-colors hover:bg-yellow-500/20 hover:text-yellow-600"
  >
    <slot />
  </div>

  <div
    v-else-if="orderState === 'waiting_payment'"
    class="rounded bg-pink-700/10 px-3 py-1 text-pink-700 transition-colors hover:bg-pink-700/20 hover:text-pink-800"
  >
    <slot />
  </div>

  <div
    v-else-if="orderState === 'order_accepted'"
    class="rounded bg-blue-500/10 px-3 py-1 text-blue-500 transition-colors hover:bg-blue-500/20 hover:text-blue-600"
  >
    <slot />
  </div>

  <div
    v-else-if="orderState === 'ready_to_pickup'"
    class="rounded bg-green-600/10 px-3 py-1 text-green-600 transition-colors hover:bg-green-600/20 hover:text-green-700"
  >
    <slot />
  </div>

  <div
    v-else-if="orderState === 'transaction_complete'"
    class="rounded bg-purple-600/10 px-3 py-1 text-purple-600 transition-colors hover:bg-purple-600/20 hover:text-purple-700"
  >
    <slot />
  </div>
  <div v-else class="bg-black/5">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    orderState: {
      type: String,
    },
  },
});
</script>
