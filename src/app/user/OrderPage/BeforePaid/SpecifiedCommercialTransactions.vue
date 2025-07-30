<template>
  <div>
    <div class="text-xl font-bold text-black/30">
      {{ $t("order.paymentAndCancellation") }}
    </div>
    <div class="mt-2 rounded-lg bg-white p-4 shadow-sm">
      <div>
        <div class="text-sm font-bold text-black/30">
          {{ $t("transactionsAct.phone") }}
        </div>

        <div class="mt-1 text-sm">
          {{ shopInfo.phoneNumber }}
        </div>
      </div>
      <div class="mt-4">
        <!--for omochikaeri-->
        <div>
          <div class="text-sm font-bold text-black/30">
            {{ $t("transactionsAct.cancellation") }}
          </div>

          <ul class="mt-1 ml-5 list-outside list-disc text-sm">
            <li>{{ $t("transactionsAct.cancellationDescription1") }}</li>
            <li>{{ $t("transactionsAct.cancellationDescription4") }}</li>
            <li>
              {{ $t("transactionsAct.cancellationDescription5") }}
              <a
                @click="openTransactionsAct()"
                class="text-op-teal text-sm font-bold underline"
                >{{ $t("transactionsAct.link") }}</a
              >
              {{ $t("transactionsAct.cancellationDescription6") }}
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-4">
        <!--for omochikaeri-->
        <div>
          <div class="text-sm font-bold text-black/30">
            {{ $t("transactionsAct.payment") }}
          </div>
          <ul class="mt-1 ml-5 list-outside list-disc text-sm">
            <li>{{ $t("transactionsAct.paymentDescriptionCardNote") }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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
