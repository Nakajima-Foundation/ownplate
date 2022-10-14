<template>
  <div>
    <div class="grid grid-cols-2 gap-2">
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow"
        :class="
          value === 'takeout'
            ? 'border-2 border-op-teal text-op-teal'
            : 'cursor-pointer text-black text-opacity-40'
        "
        @click="input('takeout')"
      >
        <i class="material-icons w-full text-center"> shopping_cart </i>
        <div class="-mt-0.5 text-center text-lg font-bold">
          {{ $t("mobileOrder.shopInfo.takeout") }}
        </div>
        <div class="mt-0.5 px-4 text-center text-xs font-bold">
          {{ $t("mobileOrder.shopInfo.takeoutDesctiption") }}
        </div>
      </div>
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow"
        :class="
          value === 'pickup'
            ? 'border-2 border-op-teal text-op-teal'
            : 'cursor-pointer text-black text-opacity-40'
        "
        @click="input('pickup')"
      >
        <i class="material-icons w-full text-center"> local_mall </i>
        <div class="-mt-0.5 text-center text-lg font-bold tracking-tighter">
          {{ $t("mobileOrder.shopInfo.pickup") }}
        </div>
        <div class="mt-0.5 px-4 text-center text-xs font-bold">
          {{ $t("mobileOrder.shopInfo.pickupDesctiption") }}
        </div>
      </div>
    </div>
    <b-modal :active.sync="popup"> </b-modal>
  </div>
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";
export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const popup = ref(false);

    const input = (value) => {
      if (props.value !== value) {
        ctx.root.$store.commit("setAlert", {
          title: "mobileOrder.title",
          code: "mobileOrder.code",
          callback: async () => {
            ctx.emit("input", value);
          },
        });
      }
    };
    return {
      input,
      popup,
    };
  },
});
</script>
