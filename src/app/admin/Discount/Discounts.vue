<template>
  <div v-if="notFound">
    404
  </div>
  <div class="mx-6 mt-6" v-else>
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
            class="mt-6 lg:flex lg:items-center"
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

    <div class="mt-6 lg:flex lg:items-center" v-else>
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <div class="flex-shrink-0">
          <back-button url="/admin/restaurants/" />
        </div>
      </div>
    </div>

    <div class="text-xl font-bold text-black text-opacity-30 mb-2 mt-4">
      {{ $t("admin.promotion.list") }}
    </div>
    <div v-for="(promotion, k) in promotionDataSet" :key="k"
         :class="!promotion.currentOpen ? 'bg-opacity-10 bg-black rounded-lg p-4 shadow mb-2' : 'rounded-lg bg-white p-4 shadow mb-2'">
      <div v-if="promotion.currentOpen" class="font-bold text-green-600 mb-2 rounded-lg bg-green-600 bg-opacity-10 py-1 text-center">{{ $t("admin.promotion.activationState") }}</div>
			<div class="inline-flex mb-1 items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
        	{{ $t("admin.promotion.name") }}: 
				</div>
				<router-link :to="isInMo ? `/admin/discounts/${promotion.promotionId}` : `/admin/restaurants/${shopInfo.restaurantId}/discounts/${promotion.promotionId}`">
				<div class="inline-flex items-center ml-1 font-bold text-op-teal">
				{{ promotion.promotionName }}<i class="material-icons ml-1">edit</i></div></router-link>
			</div>

			<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
      		{{ $t("admin.promotion.activation") }}: 
				</div>
				<div class="ml-1">
					{{ promotion.enable ? "あり" : "なし" }}
				</div>
			</div>

			<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
      		{{ $t("admin.promotion.type") }}: 
				</div>
				<div class="ml-1l">
      		<template v-if="promotion.type === 'discount'">{{ $t('admin.promotion.discount') }}</template>
      		<template v-if="promotion.type === 'onetimeCoupon'">{{ $t('admin.promotion.onetimeCoupon') }}</template>
      		<template v-if="promotion.type === 'multipletimesCoupon'">{{ $t('admin.promotion.multipletimesCoupon' )}}</template>
				</div>
			</div>

			<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
      		{{ $t("admin.promotion.period") }}: 
				</div>
				<div class="ml-1">
					{{ promotion.hasTerm ? "あり":"なし" }} {{ promotion.hasTerm ? moment(promotion.termFrom).format("YYYY/MM/DD HH:mm") + "~" + moment(promotion.termTo).format("YYYY/MM/DD HH:mm") :"" }}<br/> 
				</div>
			</div>

			<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
      		{{ $t("admin.promotion.minimumAmount") }}: 
				</div>
				<div class="ml-1">
					{{ promotion.discountThreshold }}{{ $t("admin.promotion.yen") }}
				</div>
			</div>

			<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
      		{{ $t("admin.promotion.limitation") }}: 
				</div>
				<div class="ml-1">
					{{ promotion.usageRestrictions  ? "あり(1回)" : "なし"}}
				</div>
			</div>

			<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
      		{{ $t("admin.promotion.discounts") }}: 
				</div>
				<div class="ml-1">
      		<template v-if="promotion.discountMethod === 'amount'">{{ $t("admin.promotion.amount") }}/{{ promotion.discountValue }}円</template>
      		<template v-if="promotion.discountMethod === 'ratio'">{{ $t("admin.promotion.ratio") }}/{{ promotion.discountValue }}%</template>
				</div>
			</div>

			<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
      		{{ $t("admin.promotion.paymentMethod") }}: 
				</div>
				<div class="ml-1">
      		<template v-if="promotion.paymentRestrictions === 'stripe'">{{ $t("admin.promotion.creditCard") }}</template>
      		<template v-else-if="promotion.paymentRestrictions === 'instore'">{{ $t("admin.promotion.store") }}</template>
      		<template v-else>{{ $t("admin.promotion.unrestricted") }}</template>
				</div>
			</div>

      <router-link :to="isInMo ? `/admin/discounts/${promotion.promotionId}/history` : `/admin/restaurants/${shopInfo.restaurantId}/discounts/${promotion.promotionId}/history`">
				<div class="flex items-center justify-center mt-3 h-9 w-24 rounded-full bg-black bg-opacity-5 font-bold text-op-teal">{{ $t("admin.promotion.history") }}</div></router-link>
    </div>

    <div>
      <button
        @click="newDiscount"
        class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow mt-2"
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
import BackButton from "@/components/BackButton.vue";

import {
  usePromotionsForAdmin,
  getPromotionCollctionPath,
} from "@/utils/promotion";

import {
  setDoc,
  doc,
  collection,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

import {
  useAdminUids,
  notFoundResponse,
} from "@/utils/utils";
import { checkShopAccount } from "@/utils/userPermission";

export default defineComponent({
  components: {
    AdminHeader,
    BackButton,
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
  setup(props) {
    const id = props.isInMo ? props.moPrefix : props.shopInfo?.restaurantId;
    const { promotionDataSet } = usePromotionsForAdmin(props.isInMo, id as string);

    const { ownerUid, uid, isOwner } = useAdminUids();
    console.log(props.isInMo);
    if (props.isInMo) {
      if (!isOwner.value) {
        return notFoundResponse;
      }
      if (props.shopInfo) {
        return notFoundResponse;
      }
    } else if (
      !checkShopAccount(props.shopInfo || {}, ownerUid.value) || !ownerUid.value 
    ) {
      return notFoundResponse;
    }

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
        createdAt: serverTimestamp(),
      };
      const newData = await setDoc(doc(db, path + "/" + promotionId), data);
    };
    
    return {
      promotionDataSet,
      newDiscount,
      notFound: false,
    };
  },
});

</script>

