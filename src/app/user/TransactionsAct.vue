<template>
  <div>
    <div class="inline-block">
      <!-- Transactions Act Button -->
      <a
        @click="openTransactionsAct()"
        class="inline-flex items-center justify-center"
      >
        <i class="material-icons mr-2 text-lg text-op-teal">account_balance</i>
        <div class="text-sm font-bold text-op-teal">
          {{ $t("transactionsAct.title") }}
        </div>
      </a>
    </div>

    <TransactionsActModal
      :shopInfo="shopInfo"
      :isDelivery="isDelivery"
      ref="contents"
    />
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

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
  setup(props, ctx) {
    const openTransactionsAct = () => {
      ctx.refs.contents.openTransactionsAct();
    };
    return {
      openTransactionsAct,
    };
  },
});
</script>
