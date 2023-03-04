<template>
  <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
    <!-- Title -->
    <div class="text-xl font-bold text-black text-opacity-40">
      {{ $t("admin.order.cancelTitle") }}
    </div>
    
    <!-- Message -->
    <div class="mt-6 text-base">
      {{ $t("admin.order.cancelMessage") }}
    </div>
    
    <!-- Call -->
    <div v-if="orderInfo.phoneNumber" class="mt-6 text-center">
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
      <div class="mt-2 font-bold" v-if="!isInMo">
        {{ orderInfo.name }}
      </div>
    </div>
    
    <div v-if="enableCancelReason" class="mt-2">
      <o-select v-model="cancelReason" rootClass="m-auto">
        <option
          v-for="(reason, key) in cancelReasons"
          :value="reason.key"
          :key="key"
          >
          {{ reason.message }}
        </option>
      </o-select>
    </div>
    
    <!-- Cancel -->
    <div class="mt-4 text-center">
      <button
        :disabled="updating || !enabled"
        @click="handleCancel"
        class="b-reset-tw"
        >
        <div
          class="inline-flex h-12 items-center justify-center rounded-full bg-red-700 px-6"
          :class="updating || !enabled ? 'bg-opacity-10' : ''"
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
    <div class="mt-6 text-center">
      <a
        @click="closeCancel()"
        class="inline-flex h-12 items-center justify-center rounded-full bg-black bg-opacity-5 px-6"
        style="min-width: 8rem"
        >
        <div class="text-base font-bold text-black text-opacity-60">
          {{ $t("menu.close") }}
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  PropType,
} from "@vue/composition-api";
import {
  stripeCancelIntent,
} from "@/lib/stripe/stripe";
import * as analyticsUtil from "@/lib/firebase/analytics";

import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import ButtonLoading from "@/components/Button/Loading.vue";

import { cancelReasons, enableReason } from "@/config/project";

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
    isInMo: {
      type: Boolean,
      required: true,
    },
  },
  
  components: {
    ButtonLoading,
  },
  setup(props, ctx) {
    const router = ctx.root.$router;
    const store = ctx.root.$store;

    const updating = ref(false);

    const enableCancelReason = props.isInMo && enableReason;
    const cancelReason = ref("");
    const selectedReason = computed(() => {
      return cancelReason.value !== "";
    });
    const enabled = computed(() => {
      return !enableCancelReason || selectedReason.value;
    });
    
    const sendRedunded = () => {
      analyticsUtil.sendRedunded(
        props.orderInfo,
        props.orderId,
        props.shopInfo,
        props.shopInfo.restaurantId
      );
    };

    const handleCancel = async () => {
      if (!enabled.value) {
        return ;
      }
      
      try {
        updating.value = true;
        const { data } = await stripeCancelIntent({
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
      ctx.emit("close")
    };
    return {
      handleCancel,
      updating,
      enabled,
      enableCancelReason,
      cancelReasons,
      cancelReason,
      closeCancel,
    };

  },
});
</script>