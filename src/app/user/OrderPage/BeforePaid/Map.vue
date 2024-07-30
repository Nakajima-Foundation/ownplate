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

    <GMapMap
      ref="gMap"
      :center="{ lat: 35.6809591, lng: 139.7673068 }"
      :options="{ fullscreenControl: false }"
      :zoom="15"
      style="width: 100%; height: 480px; position: relative; overflow: hidden"
      @click="gmapClick"
    ></GMapMap>
    <div if="estimatedDistance !== null">
      {{ $t("delivery.estimatedDistance") }}: {{ estimatedDistance }}m:
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
    const location = props.shopInfo.location;
    const radius =
      props.deliveryInfo && props.deliveryInfo.radius
        ? props.deliveryInfo.radius
        : 1;

    let gCenter: any = null;
    let gHome: any = null;
    let markers: any[] = [];
    const circles: any[] = [];
    let map: any = null;

    const estimatedDistance = ref<number | null>(null);
    const gMap = ref();

    onMounted(async () => {
      map = await gMap.value.$mapPromise;
      if (location) {
        setCurrentLocation();
      }
    });

    const removeAllMarker = () => {
      if (markers && markers.length > 0) {
        markers.map((marker) => {
          marker.setMap(null);
        });
        markers = [];
      }
    };
    const updateMarker = async () => {
      if (!map) {
        return;
      }
      removeAllMarker();
      if (gCenter) {
        const marker = new google.maps.Marker({
          position: gCenter,
          map,
          icon: {
            url: "http://maps.google.co.jp/mapfiles/ms/icons/restaurant.png",
          },
        });
        markers.push(marker);
      }
      if (gHome) {
        const marker = new google.maps.Marker({
          position: gHome,
          map,
          icon: {
            url: "http://maps.google.co.jp/mapfiles/ms/icons/blue-dot.png",
          },
        });
        markers.push(marker);
      }
    };

    const setHomeLocation = (lat: number, lng: number) => {
      if (google) {
        gHome = new google.maps.LatLng(lat, lng);
      }
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
    const gmapClick = (arg: any) => {
      const latLng = arg?.event?.latLng || arg.latLng;
      setHome(latLng.lat(), latLng.lng());
    };

    const updateCircle = async () => {
      if (!props.deliveryInfo.enableAreaMap) {
        return;
      }
      map.setCenter(location);
      const circle = new google.maps.Circle({
        center: gCenter,
        fillColor: "#ff0000",
        fillOpacity: 0.3,
        map: map,
        radius: Number(radius),
        strokeColor: "#ff0000",
        strokeOpacity: 1,
        strokeWeight: 1,
      });
      circle.addListener("click", gmapClick);
      circles.push(circle);
    };
    const updateLocation = (pos: { lat: number; lng: number }) => {
      setHomeLocation(pos.lat, pos.lng);
    };

    const setCurrentLocation = async () => {
      if (location && location.lat && location.lng) {
        gCenter = new google.maps.LatLng(location.lat, location.lng);
        map.setCenter(location);
        updateMarker();
        updateCircle();
      }
    };

    const conv = () => {
      const geocoder = new google.maps.Geocoder();
      geocoder
        .geocode({ address: props.fullAddress, language: "ja" })
        .then((response: any) => {
          const res = response.results[0];
          setHome(res.geometry.location.lat(), res.geometry.location.lng());
        });
    };
    return {
      conv,
      gMap,
      gmapClick,
      estimatedDistance,
      radius,
      updateLocation,
    };
  },
});
</script>
