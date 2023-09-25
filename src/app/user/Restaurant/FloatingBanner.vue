<template>
  <!-- for Promotion -->
  <div>
    <div
      class="mb-2 border-4 border-op-teal text-op-teal text-center font-bold fixed left-4 right-4 mx-auto max-w-lg cursor-pointer items-center rounded-full bg-white p-3 shadow-lg bottom-3 z-30 sm:bottom-8"
      @click="promotionVisible = true"
    >
      <div class="text-xs">
        <PromotionMessage6 :promotion="promotion" />
      </div>
      <div class="text-lg mt-0.5 -mb-0.5">
        <PromotionMessage5 :promotion="promotion" />
      </div>
    </div>
    <o-modal v-model:active="promotionVisible" width="80%" scroll="keep">
      <div class="my-6 rounded-lg bg-white shadow-lg border-op-teal border-2">
        <div class="text-center bg-op-teal text-white font-bold py-1">
          {{ $t("promotion.heading") }}
        </div>
        <div v-for="(v, k) in possiblePromotions" :key="k" class="px-6">
          <div class="mt-5 text-lg font-bold text-opacity-40">
            {{ v.promotionName }}
          </div>

          <div class="font-bold mt-2 text-op-teal">
            <template v-if="v.discountMethod === 'amount'"
              >{{ $t("promotion.fromAmountSpent") }}
              <span class="text-xl">¥{{ v.discountValue }}</span>
              {{ $t("promotion.discount") }}</template
            >
            <template v-if="v.discountMethod === 'ratio'"
              >{{ $t("promotion.fromAmountSpent") }}
              <span class="text-xl">{{ v.discountValue }}%</span>
              {{ $t("promotion.discount") }}</template
            >
          </div>

          <div v-if="v.hasTerm">
            <div class="text-sm text-black text-opacity-40 font-bold mt-3">
              {{ $t("promotion.period") }}
            </div>
            <div class="mt-0.5">
              {{
                moment(v.termFrom).format("YYYY/MM/DD HH:mm") +
                " 〜 " +
                moment(v.termTo).format("YYYY/MM/DD HH:mm")
              }}
            </div>
          </div>

          <div class="text-sm text-black text-opacity-40 font-bold mt-2">
            {{ $t("promotion.terms") }}
          </div>
          <ul class="list-disc list-outside mt-0.5">
            <li class="ml-5">
              ¥{{ v.discountThreshold }}{{ $t("promotion.applied") }}
            </li>
            <li class="ml-5">
              {{
                v.usageRestrictions
                  ? $t("promotion.oneTimeOnly")
                  : $t("promotion.noLimit")
              }}
            </li>
          </ul>

          <div class="border mt-5"></div>
        </div>

        <div class="bg-black bg-opacity-5 p-2 text-xs m-6 rounded-lg">
          <div class="font-bold">
            {{ $t("promotion.notes") }}
          </div>
          <ul class="list-disc list-outside">
            <li class="ml-4 mt-0.5">
              {{ $t("promotion.notes1") }}
            </li>
            <li class="ml-4 mt-0.5">
              {{ $t("promotion.notes2") }}
            </li>
          </ul>
        </div>
      </div>
    </o-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

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
