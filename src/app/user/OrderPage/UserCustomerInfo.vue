<template>
  <CustomerInfo
    :shopInfo="shopInfo"
    :customer="customer"
    :phoneNumber="nationalPhoneNumber"
  />
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";
import CustomerInfo from "@/components/CustomerInfo.vue";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase9";

import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    orderInfo: {
      type: Object,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
  },
  components: {
    CustomerInfo,
  },
  setup(props, ctx) {
    const customer = ref({});
    getDoc(
      doc(
        db,
        `restaurants/${ctx.root.$route.params.restaurantId}/orders/${props.orderId}/customer/data`
      )
    ).then((doc) => {
      customer.value = doc.data();
    });
    const phoneNumber = parsePhoneNumber(props.orderInfo?.phoneNumber || "");
    const nationalPhoneNumber = phoneNumber ? formatNational(phoneNumber) : "";
    return {
      customer,
      nationalPhoneNumber,
    };
  },
});
</script>
