<template>
  <div>
    <!-- Transactions Act Popup-->
    <t-modal v-model:active="transactionsActPopup" width="488" scroll="keep">
      <Contents
        :shopInfo="shopInfo"
        :isDelivery="isDelivery"
        @closeTransactionsAct="closeTransactionsAct"
        closeButton="menu.close"
      />
    </t-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import type { RestaurantInfoData } from "@/models/RestaurantInfo";
import Contents from "@/app/user/TransactionsAct/Contents.vue";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    isDelivery: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    Contents,
  },
  setup() {
    const transactionsActPopup = ref(false);

    const openTransactionsAct = () => {
      transactionsActPopup.value = true;
    };
    const closeTransactionsAct = () => {
      transactionsActPopup.value = false;
    };

    return {
      transactionsActPopup,
      openTransactionsAct, // call by parent
      closeTransactionsAct, // call by parent
    };
  },
});
</script>
