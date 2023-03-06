<template>
  <div class="mx-6 mt-6">
    discounts
    <div v-for="(promotion, k) in promotionDataSet">
      名前: {{ promotion.promotionName }}<br/>
      有効: {{ promotion.enable ? "はい" : "いいえ" }}<br/>
      期間: {{ promotion.hasTerm ? "あり":"なし" }} {{ promotion.hasTerm ? promotion.termFrom.toDate().toISOString().slice(0, 10) + "~" + promotion.termTo.toDate().toISOString().slice(0, 10) :"なし" }}<br/> 
      利用回数制限(１回): {{ promotion.usageRestrictions  ? "はい" : "いいえ"}}<br/>
      利用可能最低金額: {{ promotion.discountThreshold }}円<br/>
      割引タイプ:
      <template v-if="promotion.type === 'discount'">ディスカウント</template>
      <template v-if="promotion.type === 'onetimeCoupon'">１回のみ発行可能クーポン</template>
      <template v-if="promotion.type === 'multipletimesCoupon'">発行回数制限なしクーポン</template><br/>
      割引:
      <template v-if="promotion.discountMethod === 'amount'">一律{{ promotion.discountValue }}円</template>
      <template v-if="promotion.discountMethod === 'ratio'">割引率{{ promotion.discountValue }}%</template>
      <br/>
      決済方法制限: 
      <template v-if="promotion.paymentRestrictions === 'stripe'">カード決済</template>
      <template v-else-if="promotion.paymentRestrictions === 'instore'">現地払い</template>
      <template v-else-if="promotion.paymentRestrictions === 'instore'">なし</template>
      <br/>
    </div>
  </div>
</template>


<script lang="ts">
import {
  defineComponent,
} from "@vue/composition-api";

import { useIsInMo } from "@/utils/utils";
import { usePromitionsForAdmin } from "@/app/user/promotion";

export default defineComponent({
  props: {
    isInMo: {
      type: Boolean,
      required: false,
    },
    moPrefix: {
      type: String,
      required: false,
    },
    shopInfo: {
      type: Object,
      required: false,
    },
    
  },
  setup(props, ctx) {
    const id = props.isInMo ? props.moPrefix : props.shopInfo?.restaurantId;
    const { promotionDataSet } = usePromitionsForAdmin(props.isInMo, id as string);
    
    return {
      promotionDataSet,
    };
  },
});

</script>

