<template>
  <div>
    <div class="text-center text-xl font-bold text-green-600">
      {{ $t("order.ec.customerInfo") }}
    </div>
    <div class="mt-2 rounded-lg bg-white p-4 shadow">
      <div class="text-base font-bold">{{ $t("order.ec.zip") }}</div>
      <div class="mb-2">
        {{ customer.zip }}
      </div>
      <div class="text-base font-bold">{{ $t("order.ec.address") }}</div>
      <div class="mb-2">{{ customer.prefecture }}{{ customer.address }}</div>
      <div class="text-base font-bold">{{ $t("order.ec.name") }}</div>
      <div class="mb-2">
        {{ customer.name }}
      </div>
      <template v-if="customer.email">
        <div class="text-base font-bold">{{ $t("order.ec.email") }}</div>
        <div class="mb-2">
          {{ customer.email }}
        </div>
      </template>
      <template v-if="customer.location && shopInfo.location">
        <div class="text-base font-bold">
          {{ $t("delivery.deliveryLocation") }}
        </div>
        <div class="mb-2">
          <GoogleMap
            api-key="AIzaSyBopNQwD1RT2k9dLqH6WYPWIkMZF3RWXMQ"
            style="width: 100%; height: 50vh"
            :center="computedCenter"
            :zoom="12"
          >
            <Marker2
              :options="{
                position: customer.location,
                icon: {
                  url: 'http://maps.google.co.jp/mapfiles/ms/icons/blue-dot.png',
                },
              }"
            />
            <Marker2
              :options="{
                position: shopInfo.location,
                icon: {
                  url: 'http://maps.google.co.jp/mapfiles/ms/icons/restaurant.png',
                },
              }"
            />
          </GoogleMap>
        </div>
      </template>
      <div class="text-base font-bold">{{ $t("order.ec.phone") }}</div>
      <div class="mb-2">
        {{ phoneNumber }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, onMounted } from "vue";
import { GoogleMap, Marker as Marker2 } from "vue3-google-map";

export default defineComponent({
  components: { GoogleMap, Marker2 },
  props: {
    shopInfo: {
      type: Object as PropType<{
        location: { lat: number; lng: number }
      }>,
      required: true,
    },
    customer: {
      type: Object as PropType<{
        location: { lat: number; lng: number }
      }>,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const info_windows = ref(null);

    const computedCenter = computed(() => {
      if (
        props.customer?.location &&
        props.shopInfo?.location // &&
        // typeof props.customer.location.lat === 'number' &&
        // typeof props.customer.location.lng === 'number' &&
        // typeof props.shopInfo.location.lat === 'number' &&
        // typeof props.shopInfo.location.lng === 'number'
      ) {
        return {
          lat: (props.customer.location.lat + props.shopInfo.location.lat) / 2,
          lng: (props.customer.location.lng + props.shopInfo.location.lng) / 2
        };
      }
      return { lat: 35.6762, lng: 139.6503 };
    });

    // debug
    onMounted(() => {
      console.log("🍰 ========== CustomerInfo Mounted ==========");
      console.log("🍰 customer object:", props.customer);
      console.log("🍰 customer typeof:", typeof props.customer);
      console.log("🍰 customer keys:", Object.keys(props.customer));
      console.log("🍰 customer location:", props.customer?.location);
      console.log("🍰 shopInfo object:", props.shopInfo);
      console.log("🍰 shopInfo location:", props.shopInfo?.location);
      console.log("🍰 computedCenter:", computedCenter.value);
      console.log("🍰 =====================================");
    });

    return {
      info_windows,
      computedCenter,
    };
  },
});
</script>
