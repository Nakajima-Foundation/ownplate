<template>

<div class="mt-4 mx-6">
    <div class="mt-4">
        <div class="text-sm font-bold pb-2">
          {{ $t("delivery.areaSetting") }}
        </div>
    </div>

    <!-- area map -->
    <div class="mt-4">
        <div class="text-sm font-bold pb-2 flex">
          <b-checkbox v-model="enableAreaMap" />
          {{ $t("delivery.setAreaMap") }}
        </div>
        <div>
          <span>{{ $t("delivery.setAreaMapNotice") }}</span>
        </div>
        <div>
          <GMap
            ref="gMap"
            :center="{ lat: 35.6809591, lng: 139.7673068 }"
            :options="{ fullscreenControl: false }"
            :zoom="15"
            @loaded="mapLoaded"
            ></GMap>
        </div>
        <div class="flex mt-2">
          <span class="flex-item mt-auto mb-auto inline-block mr-2">
            {{ $t("delivery.deliveryRange") }}:
          </span>
          <span class="flex-item mt-auto mb-auto inline-block mr-2">
            <input v-model="radius"
                   :disabled="!enableAreaMap"
                   /> m
          </span>
          <b-button
            class="h-12 rounded-full bg-op-teal inline-flex justify-center items-center px-6 shadow"
            style="min-width:8rem;"
            :disabled="!enableAreaMap"
            @click="updateCircle">
            <span class="text-white text-base font-bold">
              {{ $t("delivery.updateDeliveryRange") }}
            </span>
          </b-button>
        </div>
    </div>
    <!-- area text -->
    <div class="mt-4">
      <div class="text-sm font-bold pb-2 flex">
        <b-checkbox v-model="enableAreaText" />
        {{ $t("delivery.setAreaText") }}
      </div>

      <b-input
        v-model="areaText"
        type="textarea"
        :placeholder="$t('delivery.areaTextExample')"
        :disabled="!enableAreaText"
        >
    </b-input>
    </div>

    <!-- Save Button -->
    <div class="mt-4 text-center">
      <b-button
        @click="saveDeliveryArea"
        class="b-reset-tw"
        >
          <div
            class="h-12 rounded-full bg-op-teal inline-flex justify-center items-center px-6 shadow"
            style="min-width:8rem;"
          >
            <span class="text-white text-base font-bold">{{
              $t("editCommon.save")
            }}</span>
          </div>
        </b-button>
    </div>

</div>

</template>


<script>
import { db, firestore } from "~/plugins/firebase.js";
  
export default {
  data() {
    return {
      enableAreaMap: true,
      enableAreaText: false,
      notFound: null,
      shopInfo: {},
      markers: [],
      circles: [],
      radius: 500,
      center: null,
      areaText: "",
    };
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
    fillColor() {
      return this.enableAreaMap ? '#ff0000' : '#ffffff';
    }
  },
  watch: {
    enableAreaMap: function() {
      this.updateCircle();
    },
  },
  async created() {
    const restaurant = await db.doc(`restaurants/${this.restaurantId()}`).get();
    const restaurant_data = restaurant.data();
    this.shopInfo = Object.assign({}, this.shopInfo, restaurant_data);
    const location = this.shopInfo.location;
    
    const deliveryDoc = await db.doc(`restaurants/${this.restaurantId()}/delivery/area`).get();
    if (deliveryDoc.exists) {
      const data = deliveryDoc.data();
      this.enableAreaMap = data.enableAreaMap;
      this.enableAreaText = data.enableAreaText;
      this.radius = data.radius;
      this.areaText = data.areaText;
    }
    this.center = new google.maps.LatLng(location.lat, location.lng)
    this.mapLoaded();
  },
  mounted() {
    this.mapLoaded();
  },
  methods: {
    async saveDeliveryArea() {
      const data = {
        enableAreaMap: this.enableAreaMap,
        enableAreaText: this.enableAreaText,
        radius: this.radius,
        areaText: this.areaText,
        uid: this.uid
      };
      await db.doc(`restaurants/${this.restaurantId()}/delivery/area`).set(data);
    },
    mapLoaded() {
      if (this.shopInfo && this.shopInfo.location) {
        this.setCurrentLocation(this.shopInfo.location);
      }
    },
    updateCircle() {
      this.removeAllCircle();
      this.$refs.gMap.map.setCenter(this.maplocation);
      const circle = new google.maps.Circle({
        center: this.center,
        fillColor: this.fillColor,
        fillOpacity: 0.3,
        map: this.$refs.gMap.map,
        radius: Number(this.radius),
        strokeColor: '#ff0000',
        strokeOpacity: 1,
        strokeWeight: 1
      });
      this.circles.push(circle);
    },
    setCurrentLocation(location) {
      if (
        this.$refs.gMap &&
        this.$refs.gMap.map &&
        location &&
        location.lat &&
        location.lng
      ) {
        this.$refs.gMap.map.setCenter(this.location);
        const marker = new google.maps.Marker({
          position: this.center,
          map: this.$refs.gMap.map
        });
        this.removeAllMarker();
        this.markers.push(marker);

        this.maplocation = location;
        this.updateCircle();
      }
    },
    removeAllMarker() {
      if (this.markers && this.markers.length > 0) {
        this.markers.map(marker => {
          marker.setMap(null);
        });
        this.markers = [];
      }
    },
    removeAllCircle() {
      if (this.circles && this.circles.length > 0) {
        this.circles.map(circle => {
          circle.setMap(null);
        });
        this.circles = [];
      }
    },
  },
}
</script>
