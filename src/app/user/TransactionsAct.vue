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

    <TransactionsActContents
      :shopInfo="shopInfo"
      :isDelivery="isDelivery"
      ref="contents"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";

import TransactionsActContents from "@/app/user/TransactionsAct/Contents.vue";

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
    TransactionsActContents,
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
