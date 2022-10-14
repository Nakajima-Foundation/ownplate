<template>
  <div>
  <div class="p-4">
    <div class="text-ms font-bold">
      {{ $t("shopInfo.howToReceive") }}
    </div>
    <div>
      <div
        class="rounded-lg bg-opacity-50"
        :class="value === 'takeout' ? 'bg-blue-600' : 'bg-blue-200 cursor-pointer' "
        @click="input('takeout')"
      >
        {{ $t("mobileOrder.shopInfo.takeout") }}
      </div>
      <div
        class="rounded-lg bg-opacity-50 "
        :class="value === 'pickup' ? 'bg-blue-600' : 'bg-blue-200 cursor-pointer'"
        @click="input('pickup')"
      >
        {{ $t("mobileOrder.shopInfo.pickup") }}
      </div>
    </div>
  </div>
  <b-modal
    :active.sync="popup"
    >
  </b-modal>
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
          ctx.emit('input', value);
          }
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
