<template>
  <div>
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
    <div class="mx-6 mt-6 lg:flex lg:items-center" v-else>
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <div class="flex-shrink-0">
          <back-button url="/admin/discounts/" />
        </div>
      </div>
    </div>

		<div class="mx-6 mt-4">
    <div v-if="histories.length === 0" class="mt-4 text-black text-opacity-30 font-bold">
      {{ $t("admin.promotion.noHistory") }}
    </div>
    <div v-else class="rounded-lg bg-white p-4 shadow mb-2">
      <div v-for="(h, k) in histories" :key="k">

				<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
       	 {{ $t("admin.promotion.uid") }}: 
				</div>
				<div class="ml-1">
				 {{h.uid}}
				</div></div>

				<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
        	{{ $t("admin.promotion.rid") }}: 
				</div>
				<div class="ml-1">
					{{h.restaurantId}}
				</div></div>

				<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
        	{{ $t("admin.promotion.pid") }}: 
				</div>
				<div class="ml-1">
					{{h.promotionId}}
				</div></div>

				<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
        	{{ $t("admin.promotion.oid") }}: 
				</div>
				<div class="ml-1">
					{{h.orderId}}
				</div></div>

				<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
        	{{ $t("admin.promotion.date") }}: 
				</div>
				<div class="ml-1">
					{{h.usedAt.toDate()}}
				</div></div>

				<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
        	{{ $t("admin.promotion.total") }}: 
				</div>
				<div class="ml-1">
					{{h.totalCharge}}
				</div></div>

				<div class="mt-1 flex items-center">
				<div class="text-sm text-black text-opacity-40 font-bold">
        	{{ $t("admin.promotion.discountPrice") }}: 
				</div>
				<div class="ml-1">
					{{h.discountPrice}}
				</div></div>

        <o-button
          @click="deleteHistory(h)"
          class="border-0 flex items-center justify-center mt-3 h-9 w-24 rounded-full bg-black bg-opacity-5 font-bold text-red-700">
					{{ $t("admin.promotion.delete") }}</o-button>
      </div>
			</div>
    </div>
  </div>
</template>
    

<script lang="ts">
import {
  defineComponent,
  ref,
} from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import {
  onSnapshot,
  query,
  collectionGroup,
  where,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";

import AdminHeader from "@/app/admin/AdminHeader.vue";
import BackButton from "@/components/BackButton.vue";

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
  setup(props, ctx) {
    const route = ctx.root.$route;

    const id = props.isInMo ? props.moPrefix : props.shopInfo?.restaurantId;
    const idKey = props.isInMo ? "groupId" : "restaurantId";
    const discountId = route.params.discountId as string;

    const histories = ref<any[]>([]);
    const cond = discountId ?
      query(
        collectionGroup(db, "promotionHistories"),
        where(idKey, "==", id),
        where("promotionId", "==", discountId),
      ) :
      query(
        collectionGroup(db, "promotionHistories"),
        where(idKey, "==", id)
      );
    const q = query(
      cond,
      orderBy("createdAt", "desc"),
    );
    
    onSnapshot(q,
               (docs) => {
                 const tmp: any[] = [];
                 docs.docs.map((a) => {
                   const d = a.data()
                   d.path = a.ref.path;
                   tmp.push(d);
                 });
                 histories.value = tmp;
               });

    const deleteHistory = (history: any) => {
      deleteDoc(doc(db, history.path));
      // console.log(history);
    };
    return {
      histories,
      deleteHistory,
    };
  },
});

</script>

