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
          <div ref="mapRef" class="h-[50vh] w-full" />
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
import { CustomerInfo } from "@/models/customer";
import type { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    customer: {
      type: Object as PropType<CustomerInfo>,
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

    // 店舗の座標は片方だけ入っていることがある。地図は両方そろっていないと使えない。
    const shopLocation = computed(() => {
      const location = props.shopInfo?.location;
      if (!location?.lat || !location?.lng) {
        return null;
      }
      return { lat: location.lat, lng: location.lng };
    });

    const computedCenter = computed(() => {
      const shop = shopLocation.value;
      if (props.customer?.location && shop) {
        return {
          lat: (props.customer.location.lat + shop.lat) / 2,
          lng: (props.customer.location.lng + shop.lng) / 2,
        };
      }
      return GOOGLE_MAP_DEFAULT_CENTER; // default center
    });

    const drawMap = () => {
      if (
        !mapRef.value ||
        !props.customer.location ||
        !shopLocation.value
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
      // Google Maps API mounts the marker via the `map` option in the constructor;
      // the returned reference is intentionally discarded.
      // shop marker
      // eslint-disable-next-line no-new
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: props.customer.location,
        content: getCustomerIcon(),
      });
      // eslint-disable-next-line no-new
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: shopLocation.value,
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
