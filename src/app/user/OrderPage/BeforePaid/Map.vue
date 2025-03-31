<template>
  <div class="h-2/5">
    <div>
      <button @click="conv">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-op-teal px-4"
        >
          <div class="text-sm font-bold text-white">
            {{ $t("delivery.setTheAddressInTheDeliveryLocation") }}
          </div>
        </div>
      </button>
    </div>
    <div class="mt-1 text-sm">
      {{ $t("delivery.setTheAddressInTheDeliveryLocationDescription") }}
    </div>
    <div class="text-xm mt-2 font-bold text-black text-opacity-30">
      {{ $t("delivery.setDeliveryLocation") }}
    </div>

    <div
      ref="mapContainer"
      style="width: 100%; height: 480px; position: relative; overflow: hidden"
    ></div>

    <div v-if="estimatedDistance !== null">
      {{ $t("delivery.estimatedDistance") }}: {{ estimatedDistance }}m
      <div v-if="deliveryInfo.enableAreaMap">
        {{ $t("delivery.availableDeliveryDistance") }} {{ radius }}m
      </div>
    </div>

    <div v-if="deliveryInfo.enableAreaText">
      <div class="text-xm mt-2 font-bold text-black text-opacity-30">
        {{ $t("delivery.aboutDeliveryArea") }}
      </div>
      <pre class="mt-2 mb-2 bg-transparent p-0">{{
        deliveryInfo.areaText
      }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { haversine_distance } from "@/utils/utils";

export default defineComponent({
  emits: ["updateHome"],
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    deliveryInfo: {
      type: Object,
      required: true,
    },
    fullAddress: {
      type: String,
      required: false,
    },
  },
  setup(props, context) {
    const mapContainer = ref<HTMLDivElement | null>(null);
    const estimatedDistance = ref<number | null>(null);
    const radius = props.deliveryInfo?.radius || 1;
    const location = props.shopInfo.location;

    let map: google.maps.Map;
    let gCenter: google.maps.LatLng;
    let gHome: google.maps.LatLng | null = null;
    const markers: google.maps.Marker[] = [];
    const circles: google.maps.Circle[] = [];

    const removeAllMarker = () => {
      markers.forEach((marker) => marker.setMap(null));
      markers.length = 0;
    };

    const updateMarker = () => {
      if (!map) return;
      removeAllMarker();

      if (gCenter) {
        markers.push(
          new google.maps.Marker({
            position: gCenter,
            map,
            icon: "http://maps.google.co.jp/mapfiles/ms/icons/restaurant.png",
          }),
        );
      }

      if (gHome) {
        markers.push(
          new google.maps.Marker({
            position: gHome,
            map,
            icon: "http://maps.google.co.jp/mapfiles/ms/icons/blue-dot.png",
          }),
        );
      }
    };

    const setHomeLocation = (lat: number, lng: number) => {
      gHome = new google.maps.LatLng(lat, lng);
      updateMarker();
      estimatedDistance.value = haversine_distance(
        lat,
        lng,
        location.lat,
        location.lng,
      );
    };

    const setHome = (lat: number, lng: number) => {
      setHomeLocation(lat, lng);
      context.emit("updateHome", { lat, lng });
    };

    const gmapClick = (e: google.maps.MapMouseEvent) => {
      const latLng = e.latLng;
      if (latLng) {
        setHome(latLng.lat(), latLng.lng());
      }
    };

    const updateCircle = () => {
      if (!props.deliveryInfo.enableAreaMap || !gCenter) return;

      const circle = new google.maps.Circle({
        center: gCenter,
        radius: Number(radius),
        strokeColor: "#ff0000",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#ff0000",
        fillOpacity: 0.3,
        map,
      });
      circle.addListener("click", gmapClick);
      circles.push(circle);
    };

    const updateLocation = (pos: { lat: number; lng: number }) => {
      setHomeLocation(pos.lat, pos.lng);
    };

    const setCurrentLocation = () => {
      if (location.lat && location.lng) {
        gCenter = new google.maps.LatLng(location.lat, location.lng);
        map.setCenter(gCenter);
        updateMarker();
        updateCircle();
      }
    };

    const conv = () => {
      const geocoder = new google.maps.Geocoder();
      geocoder
        .geocode({ address: props.fullAddress, language: "ja" })
        .then((res) => {
          const result = res.results[0];
          setHome(
            result.geometry.location.lat(),
            result.geometry.location.lng(),
          );
        });
    };

    onMounted(() => {
      if (!mapContainer.value) return;

      map = new google.maps.Map(mapContainer.value, {
        center: { lat: 35.6809591, lng: 139.7673068 },
        zoom: 15,
        fullscreenControl: false,
      });

      map.addListener("click", gmapClick);

      if (location) {
        setCurrentLocation();
      }
    });

    return {
      conv,
      estimatedDistance,
      radius,
      mapContainer,
      updateLocation,
      deliveryInfo: props.deliveryInfo,
    };
  },
});
</script>
