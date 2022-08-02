<template>
  <div>
    <div class="text-xl font-bold text-black text-opacity-30">
      {{ $t("order.paymentAndCancellation") }}
    </div>
    <div class="bg-white rounded-lg shadow p-4 mt-2">
      <div>
        <div class="text-sm font-bold text-black text-opacity-30">
          {{ $t("transactionsAct.phone") }}
        </div>

        <div class="text-sm mt-1">
          {{ shopInfo.phoneNumber }}
        </div>
      </div>
      <div class="mt-4">
        <div class="text-sm font-bold text-black text-opacity-30">
          {{ $t("transactionsAct.cancellation") }}
        </div>

        <div class="text-sm mt-1">
          ・{{ $t("transactionsAct.cancellationDescription") }}<br />
          ・{{ $t("transactionsAct.cancellationDescription4") }}<br />
          ・{{ $t("transactionsAct.cancellationDescription5") }}
          <a
            @click="openTransactionsAct()"
            class="text-sm font-bold text-op-teal underline"
            >{{ $t("transactionsAct.link") }}</a
          >
          {{ $t("transactionsAct.cancellationDescription6") }}
        </div>
      </div>
      <div class="mt-4">
        <div class="text-sm font-bold text-black text-opacity-30">
          {{ $t("transactionsAct.payment") }}
        </div>
        <div class="text-sm mt-1">
          ・{{ $t("transactionsAct.paymentDescriptionCardNote") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  emits: ["openTransactionsAct"],
  setup(_, ctx) {
    const openTransactionsAct = () => {
      ctx.emit("openTransactionsAct");
    };
    return {
      openTransactionsAct,
    };
  },
});
</script>
