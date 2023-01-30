<template>
  <div>
    <div
      class="grid grid-cols-2 gap-2"
      :id="modelValue === 'takeout' ? 'isTakeout' : 'isPickup'"
    >
      <!-- pickup -->
      <div
        v-if="shopInfo.enableMoPickup && !moPickupSuspend"
        class="shado-none h-full w-full rounded-lg border-2 bg-white p-3 text-op-teal"
        :class="
          modelValue === 'pickup'
            ? 'border-op-teal'
            : 'cursor-pointer border-black border-opacity-10'
        "
        @click="input('pickup')"
      >
        <i class="material-icons w-full text-center"> local_mall </i>
        <div class="-mt-0.5 text-center text-lg font-bold tracking-tighter">
          {{ $t("mobileOrder.shopInfo.pickup") }}
        </div>
        <div class="mt-0.5 px-3 text-center text-xs font-bold">
          {{ $t("mobileOrder.shopInfo.pickupDescription", {time: shopInfo.moPickUpMinimumCookTime }, 0) }}
        </div>
      </div>
      <div
        v-else
        class="h-full w-full rounded-lg bg-black bg-opacity-5 p-3 text-black text-opacity-30"
      >
        <i class="material-icons w-full text-center"> local_mall </i>
        <div class="-mt-0.5 text-center text-lg font-bold tracking-tighter">
          {{ $t("mobileOrder.shopInfo.pickup") }}
        </div>
        <div class="mt-0.5 px-3 text-center text-xs font-bold">
          {{ $t("mobileOrder.shopInfo.pickupDescription", {time: shopInfo.moPickUpMinimumCookTime }, 0) }}
        </div>
      </div>
      <!-- takeout -->
      <div
        class="h-full w-full rounded-lg border-2 bg-white p-3 text-op-teal shadow-none"
        :class="
          modelValue === 'takeout'
            ? 'border-op-teal '
            : 'cursor-pointer border-black border-opacity-10'
        "
        @click="input('takeout')"
      >
        <i class="material-icons w-full text-center"> shopping_cart </i>
        <div class="-mt-0.5 text-center text-lg font-bold">
          {{ $t("mobileOrder.shopInfo.takeout") }}
        </div>
        <div class="mt-0.5 px-3 text-center text-xs font-bold">
          {{ $t("mobileOrder.shopInfo.takeoutDescription") }}
        </div>
      </div>
    </div>
    <div
      v-if="disabledPickupTime"
      class="mt-4 h-full w-full rounded-lg bg-red-700 bg-opacity-10 p-3 text-xs font-bold text-red-700"
    >
      {{ $t("mobileOrder.shopInfo.pickupNote", { lastOrder }, 1) }}
    </div>
    <o-modal v-model:active="popup"></o-modal>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";

import { useStore } from "vuex";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    orders: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
    disabledPickupTime: {
      type: Boolean,
      required: true,
    },
    noAvailableTime: {
      type: Boolean,
      required: false,
    },
    lastOrder: {
      type: String,
      required: false,
    },
    moPickupSuspend: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, context) {
    const store = useStore();

    const popup = ref(false);

    const input = (value) => {
      if (props.modelValue !== value) {
        if (Object.values(props.orders).length === 0) {
          context.emit("update:modelValue", value);
        } else {
          store.commit("setAlert", {
            code: "mobileOrder.methodChangeAlert",
            callback: async () => {
              context.emit("update:modelValue", value);
            },
          });
        }
      }
    };
    return {
      input,
      popup,
    };
  },
});
</script>
