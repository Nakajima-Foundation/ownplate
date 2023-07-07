<template>
  <div>
    <div
      class="my-14 mx-6 text-center text-xl font-bold text-black text-opacity-50 sm:mx-auto"
    >
      Closed
    </div>
    <div
      class="mx-6 mt-8 space-y-1 text-center font-bold text-black text-opacity-50 sm:mx-auto"
    >
      <div>Mo Closed</div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { moBaseUrl } from "@/config/project";
export default defineComponent({
  setup() {
    return { moBaseUrl };
  },
});
</script>
