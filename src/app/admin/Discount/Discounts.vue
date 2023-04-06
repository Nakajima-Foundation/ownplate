<template>
  <div class="mx-6 mt-6">
    <!-- QR Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <!-- Nav Bar -->
        <div class="level">
          <!-- Back Button and Restaurant Profile -->
          <AdminHeader
            class="mx-6 mt-6 lg:flex lg:items-center"
            :shopInfo="shopInfo"
            backLink="/admin/restaurants/"
            :showSuspend="false"
            :isInMo="isInMo"
            :moPrefix="moPrefix"
            />
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>
    <div class="text-center">
      discounts
    </div>
    <div v-for="(promotion, k) in promotionDataSet" :key="k" >
      名前: <router-link :to="isInMo ? `/admin/discounts/${promotion.promotionId}` : `/admin/restaurants/${shopInfo.restaurantId}/discounts/${promotion.promotionId}`">{{ promotion.promotionName }}</router-link><br/>
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
      <template v-else>なし</template>
      <br/>
      <router-link :to="isInMo ? `/admin/discounts/${promotion.promotionId}/history` : `/admin/restaurants/${shopInfo.restaurantId}/discounts/${promotion.promotionId}/history`">履歴</router-link><br/>
      <hr class="h-1 bg-gray-200 border-0 left-1/2 dark:bg-gray-900"/>
    </div>

    <div>
      <button
        @click="newDiscount"
        class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
        >
        <span class="text-base font-bold text-white">
          {{ $t("editCommon.new") }}
        </span>
      </button>
    </div>
  </div>
</template>


<script lang="ts">
import {
  defineComponent,
} from "vue";

import { db } from "@/lib/firebase/firebase9";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import {
  usePromotionsForAdmin,
  getPromotionCollctionPath,
} from "@/utils/promotion";

import {
  setDoc,
  doc,
  collection,
  Timestamp,
} from "firebase/firestore";

export default defineComponent({
  components: {
    AdminHeader,
  },
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
    const { promotionDataSet } = usePromotionsForAdmin(props.isInMo, id as string);

    const newDiscount = async () => {
      const path = getPromotionCollctionPath(props.isInMo, id as string)
      const promotionId = doc(collection(db, path)).id;
      const data = {
        promotionName: "no name",
        promotionId,
        enable: false,
        type: "discount",
        discountThreshold: 10000,
        paymentRestrictions: null,
        usageRestrictions: true,
        discountMethod: "amount",
        discountValue: 100,
        hasTerm: true,
        termFrom: Timestamp.fromDate(new Date()),
        termTo: Timestamp.fromDate(new Date()),
      };
      const newData = await setDoc(doc(db, path + "/" + promotionId), data);
    };
    
    return {
      promotionDataSet,
      newDiscount,
    };
  },
});

</script>

