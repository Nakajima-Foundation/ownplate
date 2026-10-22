<template>
  <CustomerInfo
    :shopInfo="shopInfo"
    :customer="customer"
    :phoneNumber="nationalPhoneNumber"
  />
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import type { OrderInfoData } from "@/models/orderInfo";
import type { RestaurantInfoData } from "@/models/RestaurantInfo";
import CustomerInfo from "@/components/CustomerInfo.vue";
import { doc, getDoc } from "firebase/firestore";
import type { CustomerInfo as CustomerInfoData } from "@/models/customer";
import { db } from "@/lib/firebase/firebase9";

import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";

import { getRestaurantId } from "@/utils/utils";

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
  },
  components: {
    CustomerInfo,
  },
  setup(props) {
    const customer = ref<CustomerInfoData>({});
    const restaurantId = getRestaurantId();
    getDoc(
      doc(
        db,
        `restaurants/${restaurantId}/orders/${props.orderId}/customer/data`,
      ),
    ).then((customerDoc) => {
      if (customerDoc.exists()) {
        customer.value = customerDoc.data();
      }
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
