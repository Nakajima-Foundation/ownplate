<template>
  <div class="p-4">
    <div class="text-ms font-bold">
      {{ $t("shopInfo.howToReceive") }}
    </div>

    <div v-if="shopInfo.deliveryOnlyStore">
      <!-- delivery only -->
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow-sm"
        :class="
          modelValue === 'delivery'
            ? 'border-2 border-op-teal text-op-teal'
            : 'cursor-pointer text-black/40'
        "
        @click="$emit('update:modelValue', 'delivery')"
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
    <!-- Toggle -->
    <div class="mt2 grid grid-cols-2 gap-2" v-else>
      <!-- takeout -->
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow-sm"
        :class="
          modelValue === 'takeout'
            ? 'border-2 border-op-teal text-op-teal'
            : 'cursor-pointer text-black/40'
        "
        @click="$emit('update:modelValue', 'takeout')"
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
        class="h-full w-full rounded-lg bg-white p-3 shadow-sm"
        :class="
          modelValue === 'delivery'
            ? 'border-2 border-op-teal text-op-teal'
            : 'cursor-pointer text-black/40'
        "
        @click="$emit('update:modelValue', 'delivery')"
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
          $t(
            "shopInfo.deliveryThresholdNotice",
            {
              price: $n(deliveryData.deliveryThreshold, "currency"),
            },
            0,
          )
        }}
      </div>
      <div v-if="deliveryData.deliveryFee > 0">
        {{
          $t(
            "shopInfo.deliveryFeeInfo",
            {
              price: $n(deliveryData.deliveryFee, "currency"),
            },
            0,
          )
        }}
        <span v-if="deliveryData.enableDeliveryFree">
          {{
            $t(
              "shopInfo.deliveryFeeThresholdInfo",
              {
                price: $n(deliveryData.deliveryFreeThreshold, "currency"),
              },
              0,
            )
          }}
        </span>
      </div>
    </div>
    <div
      v-if="modelValue === 'delivery'"
      class="mt-2 rounded-lg bg-blue-500/10 px-4 py-2"
    >
      <span class="font-bold">{{ $t("shopInfo.deliveryArea") }}</span>
      <div v-if="deliveryData.enableAreaMap">
        {{
          $t(
            "shopInfo.deliveryAreaRadius",
            {
              radius: deliveryData.radius,
            },
            0,
          )
        }}
      </div>
      <div v-if="deliveryData.enableAreaText">
        <pre class="bg-transparent p-0">{{ deliveryData.areaText }}</pre>
      </div>
      {{ $t("shopInfo.deliveryAreaInfo") }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  emits: ["update:modelValue"],
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    deliveryData: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
  },
});
</script>
