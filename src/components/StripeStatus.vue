<template>
  <div v-if="stripeState === 'pending'" class="text-yellow-500">
    <slot />
  </div>
  <div v-else-if="stripeState === 'confirmed'" class="text-green-600">
    <slot />
  </div>
  <div v-else-if="stripeState === 'canceled'" class="text-red-700">
    <slot />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    stripeState: {
      type: String,
    },
  },
});
</script>
