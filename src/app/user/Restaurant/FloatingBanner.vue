<template>
  <!-- for Promotion -->
  <div>
    <div
      class="border-op-teal text-op-teal fixed right-4 bottom-3 left-4 z-30 mx-auto mb-2 max-w-lg cursor-pointer items-center rounded-full border-4 bg-white p-3 text-center font-bold shadow-lg sm:bottom-8"
      @click="promotionVisible = true"
    >
      <div class="text-xs">
        <PromotionMessage6 :promotion="promotion" />
      </div>
      <div class="mt-0.5 -mb-0.5 text-lg">
        <PromotionMessage5 :promotion="promotion" />
      </div>
    </div>
    <t-modal
      v-model:active="promotionVisible"
      width="80%"
      scroll="keep"
      @dismissed="promotionVisible = false"
    >
      <div class="border-op-teal h-full rounded-lg border-2 bg-white shadow-lg">
        <div class="bg-op-teal py-1 text-center font-bold text-white">
          {{ $t("promotion.heading") }}
        </div>
        <div v-for="(v, k) in possiblePromotions" :key="k" class="px-6">
          <!-- TODO ys64 remove text-opacity-40 -->
          <div class="text-opacity-40 mt-5 text-lg font-bold">
            {{ v.promotionName }}
          </div>

          <div class="text-op-teal mt-2 font-bold">
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
            <div class="mt-3 text-sm font-bold text-black/40">
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

          <div class="mt-2 text-sm font-bold text-black/40">
            {{ $t("promotion.terms") }}
          </div>
          <ul class="mt-0.5 list-outside list-disc">
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

          <div class="mt-5 border border-black/10"></div>
        </div>

        <div class="m-6 rounded-lg bg-black/5 p-2 text-xs">
          <div class="font-bold">
            {{ $t("promotion.notes") }}
          </div>
          <ul class="list-outside list-disc">
            <li class="mt-0.5 ml-4">
              {{ $t("promotion.notes1") }}
            </li>
            <li class="mt-0.5 ml-4">
              {{ $t("promotion.notes2") }}
            </li>
          </ul>
        </div>
      </div>
    </t-modal>
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
