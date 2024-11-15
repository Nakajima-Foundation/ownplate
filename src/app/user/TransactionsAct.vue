<template>
  <div>
    <div class="inline-block">
      <!-- Transactions Act Button -->
      <a
        @click="openTransactionsAct()"
        class="inline-flex items-center justify-center cursor-pointer"
      >
        <i class="material-icons mr-2 text-lg text-op-teal">account_balance</i>
        <div class="text-sm font-bold text-op-teal">
          {{ $t("transactionsAct.title") }}
        </div>
      </a>
    </div>

    <TransactionsActModal
      ref="transactions"
      :shopInfo="shopInfo"
      :isDelivery="isDelivery"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import TransactionsActModal from "@/app/user/TransactionsAct/Modal.vue";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    isDelivery: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    TransactionsActModal,
  },
  setup() {
    const transactions = ref();
    const openTransactionsAct = () => {
      transactions.value.openTransactionsAct();
    };
    return {
      openTransactionsAct,
      transactions,
    };
  },
});
</script>
