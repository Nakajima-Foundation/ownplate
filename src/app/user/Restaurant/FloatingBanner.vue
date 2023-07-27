<template>
  <!-- for Promotion -->
  <div>
	<div class="mb-2 border-4 border-green-600 text-green-600 text-center font-bold fixed left-4 right-4 mx-auto max-w-lg cursor-pointer items-center rounded-full bg-white p-3 shadow-lg bottom-3 z-30 sm:bottom-8" @click="promotionVisible=true">
		<div class="text-xs">
      <PromotionMessage6 :promotion="promotion" />
    </div>
		<div class="text-lg mt-0.5 -mb-0.5">
      <PromotionMessage5 :promotion="promotion" />
    </div>
	</div>
  <o-modal :active.sync="promotionVisible" width="80%" scroll="keep">
    <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
      <div v-for="(v, k) in possiblePromotions" :key="k" class="border-b-2 pb-4 mb-4">
        <div class="font-bold text-opacity-40">{{ v.promotionName }}</div>
        <div v-if="v.hasTerm">
				  <div class="text-sm text-black text-opacity-40 font-bold">
      		  {{ $t("admin.promotion.period") }}: 
				  </div>
				  <div class="ml-1">
            {{ moment(v.termFrom).format("YYYY/MM/DD HH:mm") + "~" + moment(v.termTo).format("YYYY/MM/DD HH:mm") }}
          </div>
        </div>
				<div class="text-sm text-black text-opacity-40 font-bold">
      	  {{ $t("admin.promotion.minimumAmount") }}:
				</div>
				<div class="ml-1">
				  {{ v.discountThreshold }}{{ $t("admin.promotion.yen") }}
				</div>
				<div class="text-sm text-black text-opacity-40 font-bold">
      	  {{ $t("admin.promotion.limitation") }}
				</div>
				<div class="ml-1">
				  {{ v.usageRestrictions  ? "あり(1回)" : "なし"}}
        </div>
				<div class="text-sm text-black text-opacity-40 font-bold">
      		{{ $t("admin.promotion.discounts") }}
				</div>
				<div class="ml-1">
      		<template v-if="v.discountMethod === 'amount'">{{ $t("admin.promotion.amount") }}/{{ v.discountValue }}円</template>
      		<template v-if="v.discountMethod === 'ratio'">{{ $t("admin.promotion.ratio") }}/{{ v.discountValue }}%</template>
				</div>
      </div>

    </div>
  </o-modal>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
} from "vue";

import moment from "moment-timezone";
import PromotionMessage5 from "@/app/user/Restaurant/PromotionMessage5.vue";
import PromotionMessage6 from "@/app/user/Restaurant/PromotionMessage6.vue";

export default defineComponent({
  components: {
		PromotionMessage5,
		PromotionMessage6,
  },
  props: {
    promotion: {
      type: Object,
      required: true,
    },
    possiblePromotions: {
      type: Array,
      required: false,
    },
  },
  setup() {
    const promotionVisible = ref(false);
    return {
      promotionVisible,
      moment,
    };
  },
});
</script>
