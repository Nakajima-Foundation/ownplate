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
    <div v-if="histories.length === 0">
      No history data.
    </div>
    <div v-else>
      <div v-for="(h, k) in histories" :key="k">
        uid: {{h.uid}}<br/>
        rid: {{h.restaurantId}}<br/>
        pid: {{h.promotionId}}<br/>
        oid: {{h.orderId}}<br/>
        date: {{h.usedAt.toDate()}}<br/>
        total: {{h.totalCharge}}<br/>
        discount: {{h.discountPrice}}<br/>
        <o-button
          @click="deleteHistory(h)"
					class="border-0 flex items-center justify-center mt-2 h-9 w-20 rounded-full bg-black bg-opacity-5 font-bold text-red-700"
          >削除</o-button>
        <hr class="my-4 h-0.5 bg-gray-200 border-0 left-1/2 dark:bg-gray-900"/>
        
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

