<template>
  <div class="h-2/5">
    <div>
      <button @click="conv">
        <div
          class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-op-teal"
        >
          <div class="text-sm font-bold text-white">
            {{ $t("delivery.setTheAddressInTheDeliveryLocation") }}
          </div>
        </div>
      </button>
    </div>
    <div class="text-sm mt-1">
      {{ $t("delivery.setTheAddressInTheDeliveryLocationDescription") }}
    </div>
    <div class="text-xm font-bold text-black text-opacity-30 mt-2">
      {{ $t("delivery.setDeliveryLocation") }}
    </div>
    <GMap
      ref="gMap"
      :center="{ lat: 35.6809591, lng: 139.7673068 }"
      :options="{ fullscreenControl: false }"
      :zoom="15"
      @loaded="mapLoaded"
      @click="gmapClick"
      style="height: 100%"
    ></GMap>
    <div if="estimatedDistance !== null">
      {{ $t("delivery.estimatedDistance") }}: {{ estimatedDistance }}m:
      <div v-if="deliveryInfo.enableAreaMap">
        {{ $t("delivery.availableDeliveryDistance") }} {{ radius }}m
      </div>
    </div>

    <div v-if="deliveryInfo.enableAreaText">
      <div class="text-xm font-bold text-black text-opacity-30 mt-2">
        {{ $t("delivery.aboutDeliveryArea") }}
      </div>
      <pre class="p-0 mt-2 mb-2 bg-transparent">{{
        deliveryInfo.areaText
      }}</pre>
    </div>
  </div>
</template>

<script>
export default {
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
  computed: {
    location() {
      return this.shopInfo.location;
    },
    radius() {
      if (this.deliveryInfo && this.deliveryInfo.radius) {
        return this.deliveryInfo.radius;
      }
      return 1;
    },
  },
  watch: {
    radius() {
      this.updateCircle();
    },
  },
  data() {
    return {
      center: null,
      home: null,
      markers: [],
      circles: [],
      estimatedDistance: null,
      maplocation: null,
    };
  },
  async created() {
    this.mapLoaded();
  },
  mounted() {
    this.mapLoaded();
  },
  methods: {
    mapLoaded() {
      if (this.shopInfo && this.shopInfo.location) {
        this.setCurrentLocation(this.shopInfo.location);
      }
    },
    setCurrentLocation(location) {
      if (
        this.$refs.gMap &&
        this.$refs.gMap.map &&
        location &&
        location.lat &&
        location.lng
      ) {
        this.center = new google.maps.LatLng(location.lat, location.lng);
        this.$refs.gMap.map.setCenter(this.location);
        this.updateMarker();

        this.maplocation = location;
        this.updateCircle();
      }
    },
    updateMarker() {
      if (!this.$refs.gMap || !this.$refs.gMap.map) {
        return;
      }
      this.removeAllMarker();
      if (this.center) {
        const marker = new google.maps.Marker({
          position: this.center,
          map: this.$refs.gMap.map,
          icon: {
            url: "http://maps.google.co.jp/mapfiles/ms/icons/restaurant.png",
          },
        });
        this.markers.push(marker);
      }
      if (this.home) {
        const marker = new google.maps.Marker({
          position: this.home,
          map: this.$refs.gMap.map,
          icon: {
            url: "http://maps.google.co.jp/mapfiles/ms/icons/blue-dot.png",
          },
        });
        this.markers.push(marker);
      }
    },
    updateCircle() {
      if (
        !this.$refs.gMap ||
        !this.$refs.gMap.map ||
        !this.deliveryInfo.enableAreaMap
      ) {
        return;
      }
      this.removeAllCircle();
      this.$refs.gMap.map.setCenter(this.maplocation);
      const circle = new google.maps.Circle({
        center: this.center,
        fillColor: "#ff0000",
        fillOpacity: 0.3,
        map: this.$refs.gMap.map,
        radius: Number(this.radius),
        strokeColor: "#ff0000",
        strokeOpacity: 1,
        strokeWeight: 1,
      });
      circle.addListener("click", this.gmapClick); // todo remove lister
      this.circles.push(circle);
    },
    removeAllMarker() {
      if (this.markers && this.markers.length > 0) {
        this.markers.map((marker) => {
          marker.setMap(null);
        });
        this.markers = [];
      }
    },
    removeAllCircle() {
      if (this.circles && this.circles.length > 0) {
        this.circles.map((circle) => {
          circle.removeListener("click");
          circle.setMap(null);
        });
        this.circles = [];
      }
    },
    gmapClick(arg) {
      const latLng = arg?.event?.latLng || arg.latLng;
      this.setHome(latLng.lat(), latLng.lng());
    },
    setHome(lat, lng) {
      this.home = new google.maps.LatLng(lat, lng);
      this.$emit("updateHome", { lat, lng });
      this.updateMarker();
      this.estimatedDistance = this.haversine_distance(
        lat,
        lng,
        this.shopInfo.location.lat,
        this.shopInfo.location.lng
      );
    },
    conv() {
      const geocoder = new google.maps.Geocoder();
      geocoder
        .geocode({ address: this.fullAddress, language: "ja" })
        .then((response) => {
          const res = response.results[0];
          this.setHome(
            res.geometry.location.lat(),
            res.geometry.location.lng()
          );
        });
    },
    // https://developers-jp.googleblog.com/2019/12/how-calculate-distances-map-maps-javascript-api.html
    haversine_distance(lat1, lng1, lat2, lng2) {
      const R = 6371.071;
      const rlat1 = lat1 * (Math.PI / 180);
      const rlat2 = lat2 * (Math.PI / 180);
      const difflat = rlat2 - rlat1;
      const difflon = (lng2 - lng1) * (Math.PI / 180);

      const d =
        2 *
        R *
        Math.asin(
          Math.sqrt(
            Math.sin(difflat / 2) * Math.sin(difflat / 2) +
              Math.cos(rlat1) *
                Math.cos(rlat2) *
                Math.sin(difflon / 2) *
                Math.sin(difflon / 2)
          )
        );
      return Math.round(d * 1000);
    },
  },
};
</script>
