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
        <!--for omochikaeri-->
        <div v-if="!isInMo">
          <div class="text-sm font-bold text-black text-opacity-30">
            {{ $t("transactionsAct.cancellation") }}
          </div>

          <ul class="list-disc list-outside ml-5 text-sm mt-1">
            <li>{{ $t("transactionsAct.cancellationDescription1") }}</li>
            <li>{{ $t("transactionsAct.cancellationDescription4") }}</li>
            <li>
              {{ $t("transactionsAct.cancellationDescription5") }}
              <a
                @click="openTransactionsAct()"
                class="text-sm font-bold text-op-teal underline"
                >{{ $t("transactionsAct.link") }}</a
              >
              {{ $t("transactionsAct.cancellationDescription6") }}
            </li>
          </ul>
        </div>
        <!--for MobileOrder-->
        <div v-if="isInMo">
          <div class="text-sm font-bold text-black text-opacity-30">
            {{ $t("transactionsAct.cancellationMo") }}
          </div>

          <ul class="list-disc list-outside ml-5 text-sm mt-1">
            <li>{{ $t("transactionsAct.cancellationDescription1Mo") }}</li>
            <li>{{ $t("transactionsAct.cancellationDescription2Mo") }}</li>
            <li>{{ $t("transactionsAct.cancellationDescription4Mo") }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-4">
        <!--for omochikaeri-->
        <div  v-if="!isInMo">
          <div class="text-sm font-bold text-black text-opacity-30">
            {{ $t("transactionsAct.payment") }}
          </div>
          <ul class="list-disc list-outside ml-5 text-sm mt-1">
            <li>{{ $t("transactionsAct.paymentDescriptionCardNote") }}</li>
          </ul>
        </div>

        <!--for MobileOrder-->
        <div  v-if="isInMo">
          <div class="text-sm font-bold text-black text-opacity-30">
            {{ $t("transactionsAct.paymentNoteMo") }}
          </div>
          <ul class="list-disc list-outside ml-5 text-sm mt-1">
            <li>
              {{ $t("transactionsAct.cancellationDescription5Mo") }}
              <a
                @click="openTransactionsAct()"
                class="text-sm font-bold text-op-teal underline"
                >{{ $t("transactionsAct.link") }}</a
              >
              {{ $t("transactionsAct.cancellationDescription6Mo") }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import { useIsInMo } from "@/utils/utils";
export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  emits: ["openTransactionsAct"],
  setup(_, ctx) {
    const isInMo = useIsInMo(ctx.root);
    const openTransactionsAct = () => {
      ctx.emit("openTransactionsAct");
    };
    return {
      openTransactionsAct,
      isInMo,
    };
  },
});
</script>
