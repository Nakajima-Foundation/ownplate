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
            :api-key="GAPIKey"
            :mapId="GMAPId"
            :center="computedCenter"
            :zoom="12"
            class="w-full h-[50vh]"
            ref="mapRef"
          >
            <AdvancedMarker
              v-if="mapRef?.ready && customer.location"
              :options="{
                position: customer.location,
              }"
            />
            <AdvancedMarker
              v-if="mapRef?.ready && shopInfo.location"
              :options="{
                position: shopInfo.location,
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
import { defineComponent, ref, computed, PropType } from "vue";
import { GoogleMap, AdvancedMarker } from "vue3-google-map";
import { GAPIKey, GMAPId } from "@/config/project";

export default defineComponent({
  components: { GoogleMap, AdvancedMarker },
  props: {
    shopInfo: {
      type: Object as PropType<{
        location: { lat: number; lng: number };
      }>,
      required: true,
    },
    customer: {
      type: Object as PropType<{
        location: { lat: number; lng: number };
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
    const mapRef = ref();

    const computedCenter = computed(() => {
      if (
        props.customer?.location &&
        props.shopInfo?.location // &&
      ) {
        return {
          lat: (props.customer.location.lat + props.shopInfo.location.lat) / 2,
          lng: (props.customer.location.lng + props.shopInfo.location.lng) / 2,
        };
      }
      return { lat: 35.6762, lng: 139.6503 };
    });

    return {
      info_windows,
      computedCenter,
      mapRef,

      GAPIKey,
      GMAPId,
    };
  },
});
</script>
