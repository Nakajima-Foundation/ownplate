<template>
  <div>
    <div class="mb-2 text-base font-bold">
      {{ $t("order.customerInfo") }}
    </div>
    <div class="text-xs font-bold text-black text-opacity-40">
      {{ $t("sms.phonenumber") }}
    </div>
    <div class="mt-1 text-base">
      <div>
        <a :href="nationalPhoneURI" class="text-base font-bold">{{
          nationalPhoneNumber
        }}</a>
      </div>
      <div class="text-base">{{ orderInfo.name }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";

export default defineComponent({
  props: {
    orderInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const phoneNumber = parsePhoneNumber(props.orderInfo?.phoneNumber || "");
    const nationalPhoneNumber = phoneNumber ? formatNational(phoneNumber) : "";
    const nationalPhoneURI = formatURL(phoneNumber);
    return {
      nationalPhoneNumber,
      nationalPhoneURI,
    };
  },
});
</script>
