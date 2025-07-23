<template>
  <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
    <!-- Title -->
    <div class="text-xl font-bold text-black/40">
      {{ $t("admin.order.paymentCancelTitle") }}
    </div>

    <!-- Message -->
    <div class="mt-4 text-base">
      {{ $t("admin.order.paymentCancelMessage") }}
    </div>

    <!-- Call -->
    <div v-if="orderInfo.phoneNumber" class="mt-4 text-center">
      <div>
        <a
          :href="nationalPhoneURI"
          class="inline-flex h-12 items-center justify-center rounded-full border-2 border-op-teal px-6"
        >
          <div class="text-base font-bold text-op-teal">
            {{ nationalPhoneNumber }}
          </div>
        </a>
      </div>
      <div class="mt-2 font-bold">
        {{ orderInfo.name }}
      </div>
    </div>

    <!-- Cancel -->
    <div class="mt-4 text-center">
      <button
        :disabled="updating"
        @click="handlePaymentCancel"
        class="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ml-2"
      >
        <div
          class="inline-flex h-12 items-center justify-center rounded-full bg-red-700 px-6"
        >
          <div class="text-base font-bold text-white">
            {{ $t("admin.order.paymentCancel") }}
          </div>
        </div>
      </button>
      <div class="mt-2 text-sm font-bold text-red-700">
        {{ $t("admin.order.paymentCancelConfirm") }}
      </div>
    </div>

    <!-- Close -->
    <div class="mt-4 text-center">
      <a
        @click="closeCancel()"
        class="inline-flex h-12 items-center justify-center rounded-full bg-black/5 px-6"
        style="min-width: 8rem"
      >
        <div class="text-base font-bold text-black/60">
          {{ $t("menu.close") }}
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { stripePaymentCancelIntent } from "@/lib/firebase/functions";

import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    orderInfo: {
      type: Object,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    parentUrl: {
      type: String,
      required: true,
    },
    nationalPhoneURI: {
      type: String,
      required: true,
    },
    nationalPhoneNumber: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, ctx) {
    const router = useRouter();
    const store = useStore();

    const updating = ref(false);
    const handlePaymentCancel = async () => {
      console.log("handlePaymentCancel");

      try {
        store.commit("setLoading", true);
        updating.value = true;
        const { data } = await stripePaymentCancelIntent({
          restaurantId: props.shopInfo.restaurantId,
          orderId: props.orderId,
        });
        console.log("paymentCancel", data);
        router.push(props.parentUrl);
      } catch (error: any) {
        console.error(error.message, error.details);
        store.commit("setErrorMessage", {
          code: "stripe.cancel",
          error,
        });
      } finally {
        updating.value = false;
        store.commit("setLoading", false);
      }
    };

    const closeCancel = () => {
      ctx.emit("close");
    };
    return {
      handlePaymentCancel,
      updating,
      closeCancel,
    };
  },
});
</script>
