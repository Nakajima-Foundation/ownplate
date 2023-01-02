<template>
  <div class="p-4">
    <div class="text-ms font-bold">
      {{ $t("shopInfo.howToReceive") }}
    </div>
    <div>
      <o-radio
        name="howtoreceive"
        :value="value === 'takeout' ? 'takeout' : ''"
        :native-value="value"
        @input="$emit('input', 'takeout')"
      >
        {{ $t("shopInfo.takeout") }}
      </o-radio>
      <o-radio
        name="howtoreceive"
        :value="value === 'delivery' ? 'delivery' : ''"
        :native-value="value"
        @input="$emit('input', 'delivery')"
      >
        {{ $t("shopInfo.delivery") }}
      </o-radio>
    </div>
    <div>
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
      {{ $t("shopInfo.deliveryArea") }}
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
