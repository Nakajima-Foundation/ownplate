<template>
  <div class="p-4">
    <div class="text-ms font-bold">
      {{ $t("shopInfo.howToReceive") }}
    </div>

    <div class="mt2 grid grid-cols-2 gap-2">
      <!-- takeout -->
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow"
        :class="
          value === 'takeout'
            ? 'border-2 border-op-teal text-op-teal'
            : 'cursor-pointer text-black text-opacity-40'
        "
        @click="$emit('input', 'takeout')"
      >
        <i class="material-icons w-full text-center"> local_mall </i>
        <div class="-mt-0.5 text-center text-lg font-bold tracking-tighter">
          {{ $t("shopInfo.takeout") }}
        </div>
        <div class="mt-0.5 px-3 text-center text-xs font-bold">
          {{ $t("shopInfo.takeoutDescription") }}
        </div>
      </div>
      <!-- delivery -->
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow"
        :class="
          value === 'delivery'
            ? 'border-2 border-op-teal text-op-teal'
            : 'cursor-pointer text-black text-opacity-40'
        "
        @click="$emit('input', 'delivery')"
      >
        <i class="material-icons w-full text-center"> delivery_dining </i>
        <div class="-mt-0.5 text-center text-lg font-bold">
          {{ $t("shopInfo.delivery") }}
        </div>
        <div class="mt-0.5 px-3 text-center text-xs font-bold">
          {{ $t("shopInfo.deliveryDescription") }}
        </div>
      </div>
    </div>

    <div class="mt-2">
      <div v-if="deliveryData.enableDeliveryThreshold">
        {{
          $tc("shopInfo.deliveryThresholdNotice", 0, {
            price: $n(deliveryData.deliveryThreshold, "currency"),
          })
        }}
      </div>
      <div v-if="deliveryData.deliveryFee > 0">
        {{
          $tc("shopInfo.deliveryFeeInfo", 0, {
            price: $n(deliveryData.deliveryFee, "currency"),
          })
        }}
        <span v-if="deliveryData.enableDeliveryFree">
          {{
            $tc("shopInfo.deliveryFeeThresholdInfo", 0, {
              price: $n(deliveryData.deliveryFreeThreshold, "currency"),
            })
          }}
        </span>
      </div>
    </div>
    <div
      v-if="value === 'delivery'"
      class="mt-2 rounded-lg bg-blue-500 bg-opacity-10 px-4 py-2"
    >
      <span class="font-bold">{{ $t("shopInfo.deliveryArea") }}</span>
      <div v-if="deliveryData.enableAreaMap">
        {{
          $tc("shopInfo.deliveryAreaRadius", 0, {
            radius: deliveryData.radius,
          })
        }}
      </div>
      <div v-if="deliveryData.enableAreaText">
        <pre class="bg-transparent p-0">{{ deliveryData.areaText }}</pre>
      </div>
      {{ $t("shopInfo.deliveryAreaInfo") }}
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
    deliveryData: {
      type: Object,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
});
</script>
