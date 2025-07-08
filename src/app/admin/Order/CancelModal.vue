<template>
  <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
    <!-- Title -->
    <div class="text-xl font-bold text-black/40">
      {{ $t("admin.order.cancelTitle") }}
    </div>

    <!-- Message -->
    <div class="mt-4 text-base">
      {{ $t("admin.order.cancelMessage") }}
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
      <button :disabled="updating" @click="handleCancel" class="b-reset-tw">
        <div
          class="inline-flex h-12 items-center justify-center rounded-full bg-red-700 px-6"
          :class="updating ? 'bg-red-700/10' : ''"
        >
          <ButtonLoading v-if="updating" />
          <div class="text-base font-bold text-white">
            {{ $t("admin.order.delete") }}
          </div>
        </div>
      </button>
      <div class="mt-2 text-sm font-bold text-red-700">
        {{ $t("admin.order.deleteConfirm") }}
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
import { defineComponent, ref, PropType } from "vue";
import { stripeCancelIntent } from "@/lib/firebase/functions";
import * as analyticsUtil from "@/lib/firebase/analytics";

import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import ButtonLoading from "@/components/form/Loading.vue";

import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    orderInfo: {
      type: Object as PropType<OrderInfoData>,
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

  components: {
    ButtonLoading,
  },
  emits: ["close"],
  setup(props, ctx) {
    const router = useRouter();
    const store = useStore();

    const updating = ref(false);

    const sendRedunded = () => {
      analyticsUtil.sendRedunded(
        props.orderInfo,
        props.orderId,
        props.shopInfo,
      );
    };

    const handleCancel = async () => {
      try {
        updating.value = true;
        await stripeCancelIntent({
          restaurantId: props.shopInfo.restaurantId,
          orderId: props.orderId,
        });
        sendRedunded();
        router.push(props.parentUrl);
      } catch (error: any) {
        console.error(error.message, error.details);
        store.commit("setErrorMessage", {
          code: "order.cancel",
          error,
        });
      } finally {
        updating.value = false;
      }
    };
    const closeCancel = () => {
      ctx.emit("close");
    };

    return {
      handleCancel,
      updating,
      closeCancel,
    };
  },
});
</script>
