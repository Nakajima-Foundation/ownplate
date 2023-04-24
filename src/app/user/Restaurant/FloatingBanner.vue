<template>
	<div class="mb-2 border-4 border-green-600 text-green-600 text-center font-bold fixed left-4 right-4 mx-auto max-w-lg cursor-pointer items-center rounded-full bg-white p-3 shadow-lg bottom-3 z-30 sm:bottom-8">
    <!-- for mo -->
		<div class="text-xs" v-if="!isInMo">
      <PromotionMessage6 :promotion="promotion" />
    </div>
    <!-- for omochikaeri -->
		<div class="text-xs" v-else>
      <PromotionMessage1 :promotion="promotion" />
    </div>
		<div class="text-lg mt-0.5 -mb-0.5">
      <PromotionMessage5 :promotion="promotion" />
    </div>
	</div>
</template>

<script lang="ts">
import {
  defineComponent,
} from "@vue/composition-api";

import PromotionMessage1 from "@/app/user/Restaurant/PromotionMessage1.vue";
import PromotionMessage5 from "@/app/user/Restaurant/PromotionMessage5.vue";
import PromotionMessage6 from "@/app/user/Restaurant/PromotionMessage6.vue";

export default defineComponent({
  components: {
    PromotionMessage1,
		PromotionMessage5,
		PromotionMessage6,
  },
  props: {
    promotion: {
      type: Object,
      required: true,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
  }
});
</script>
