<template>
  <div>
    <div class="text-center text-xl font-bold text-green-600">
      {{ $t("order.ec.customerInfo") }}
    </div>
    <div class="mt-2 rounded-lg bg-white p-4 shadow-sm">
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
          <div ref="mapRef" class="w-full h-[50vh]" />
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
import {
  defineComponent,
  ref,
  computed,
  PropType,
  onMounted,
  watch,
} from "vue";
import { getShopIcon, getCustomerIcon } from "@/utils/map";
import { GMAPId } from "@/config/project";
import { GOOGLE_MAP_DEFAULT_CENTER } from "@/config/constant";

export default defineComponent({
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
    const mapRef = ref<HTMLElement | null>(null);
    const mapObj = ref<google.maps.Map>();

    const computedCenter = computed(() => {
      if (props.customer?.location && props.shopInfo?.location) {
        return {
          lat: (props.customer.location.lat + props.shopInfo.location.lat) / 2,
          lng: (props.customer.location.lng + props.shopInfo.location.lng) / 2,
        };
      }
      return GOOGLE_MAP_DEFAULT_CENTER; // default center
    });

    const drawMap = () => {
      if (
        !mapRef.value ||
        !props.customer.location ||
        !props.shopInfo.location
      ) {
        return;
      }
      if (mapObj.value) {
        return;
      }
      const map = new google.maps.Map(mapRef.value, {
        center: computedCenter.value,
        zoom: 12,
        mapId: GMAPId || undefined,
      });

      mapObj.value = map;

      // Add markers using AdvancedMarkerElement
      // shop marker
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: props.customer.location,
        content: getCustomerIcon(),
      });
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: props.shopInfo.location,
        content: getShopIcon(),
      });
    };

    const isMount = ref(false);
    onMounted(() => {
      isMount.value = true;
    });

    watch(
      [() => props.customer.location, () => props.shopInfo.location, isMount],
      () => {
        setTimeout(() => {
          drawMap();
        }, 100);
      },
    );

    return {
      mapRef,
    };
  },
});
</script>
