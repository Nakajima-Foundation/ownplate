<template>
  <div class="p-4">
    <div class="text-ms font-bold">
      {{ $t("shopInfo.howToReceive") }}
    </div>
    <div>
      <b-radio
        name="howtoreceive"
        :value="value === 'takeout' ? 'takeout' : ''"
        :native-value="value"
        @input="$emit('input', 'takeout')"
      >
        {{ $t("mobileOrder.shopInfo.takeout") }}
      </b-radio>
      <b-radio
        name="howtoreceive"
        :value="value === 'pickup' ? 'pickup' : ''"
        :native-value="value"
        @input="$emit('input', 'pickup')"
      >
        {{ $t("mobileOrder.shopInfo.pickup") }}
      </b-radio>
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
    value: {
      type: String,
      required: true,
    },
  },
});
</script>
