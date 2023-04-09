<template>
  <div class="mx-6 mt-6">
    <!-- QR Header Area -->
    <div class="columns is-gapless" v-if="shopInfo">
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
    <div class="text-xl font-bold text-black text-opacity-30 mb-4">
      discounts
    </div>
    <div v-for="(promotion, k) in promotionDataSet" :key="k" >
      <div v-if="promotion.currentOpen">現在有効</div>
			<div class="inline-flex mb-2 items-end">
        名前: <router-link :to="isInMo ? `/admin/discounts/${promotion.promotionId}` : `/admin/restaurants/${shopInfo.restaurantId}/discounts/${promotion.promotionId}`">
				<div class="inline-flex items-center ml-1 font-bold text-op-teal">
				<div>{{ promotion.promotionName }}</div><i class="material-icons ml-1">edit</i></div></router-link>
			</div>
			<div>

      ディスカウントの有効化: {{ promotion.enable ? "あり" : "なし" }}<br/>
      割引タイプ:
      <template v-if="promotion.type === 'discount'">{{ $t('admin.promotion.discount') }}</template>
      <template v-if="promotion.type === 'onetimeCoupon'">{{ $t('admin.promotion.onetimeCoupon') }}</template>
      <template v-if="promotion.type === 'multipletimesCoupon'">{{ $t('admin.promotion.multipletimesCoupon' )}}</template><br/>
      ディスカウント適用期間: {{ promotion.hasTerm ? "あり":"なし" }} {{ promotion.hasTerm ? promotion.termFrom.toISOString().slice(0, 10) + "~" + promotion.termTo.toISOString().slice(0, 10) :"" }}<br/> 
      利用可能最低金額: {{ promotion.discountThreshold }}円<br/>
      利用回数制限: {{ promotion.usageRestrictions  ? "あり(1回)" : "なし"}}<br/>
      割引:
      <template v-if="promotion.discountMethod === 'amount'">金額/{{ promotion.discountValue }}円</template>
      <template v-if="promotion.discountMethod === 'ratio'">割引率/{{ promotion.discountValue }}%</template>
      <br/>
      決済方法制限: 
      <template v-if="promotion.paymentRestrictions === 'stripe'">カード決済</template>
      <template v-else-if="promotion.paymentRestrictions === 'instore'">現地払い</template>
      <template v-else>なし</template>
      </div>
      <router-link :to="isInMo ? `/admin/discounts/${promotion.promotionId}/history` : `/admin/restaurants/${shopInfo.restaurantId}/discounts/${promotion.promotionId}/history`">
				<div class="flex items-center justify-center mt-2 h-9 w-20 rounded-full bg-black bg-opacity-5 font-bold text-op-teal">履歴</div></router-link>
      <hr class="my-4 h-0.5 bg-gray-200 border-0 left-1/2 dark:bg-gray-900"/>
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
} from "@vue/composition-api";

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

