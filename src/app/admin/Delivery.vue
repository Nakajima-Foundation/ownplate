<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <template v-if="existLocation === false">
      <div class="mt-4 mx-6">
        <div class="bg-black bg-opacity-5 rounded-lg p-4">
          <div class="text-xl font-bold text-red-600">
            <div>
              {{ $t("delivery.alert") }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <div class="mt-4 mx-6" v-else>
      <div class="bg-black bg-opacity-5 rounded-lg p-4">
        <div class="text-sm font-bold">
          <b-checkbox v-model="enableDelivery" />{{
            $tc("delivery.enableDelivery", 0, { name: shopInfo.restaurantName })
          }}
        </div>
      </div>

      <!-- area map -->
      <div class="bg-black bg-opacity-5 rounded-lg p-4 mt-4">
        <div class="text-lm font-bold pb-2">
          {{ $t("delivery.areaSetting") }}
        </div>

        <div>
          <div class="text-sm font-bold pb-2 flex">
            <b-checkbox v-model="enableAreaMap" :disabled="!enableDelivery" />
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
              <input
                v-model="radius"
                :disabled="!enableAreaMap || !enableDelivery"
              />
              m
            </span>
            <b-button
              class="b-reset-tw"
              :disabled="!enableAreaMap || !enableDelivery"
              @click="updateCircle"
            >
              <div
                class="h-12 rounded-full bg-op-teal inline-flex justify-center items-center px-6 shadow"
              >
                <span class="text-white text-base font-bold">
                  {{ $t("delivery.updateDeliveryRange") }}
                </span>
              </div>
            </b-button>
          </div>
        </div>
        <!-- area text -->
        <div class="mt-4">
          <div class="text-sm font-bold pb-2 flex">
            <b-checkbox v-model="enableAreaText" :disabled="!enableDelivery" />
            {{ $t("delivery.setAreaText") }}
          </div>

          <b-input
            v-model="areaText"
            type="textarea"
            :placeholder="$t('delivery.areaTextExample')"
            :disabled="!enableAreaText || !enableDelivery"
          >
          </b-input>
        </div>
      </div>

      <div class="bg-black bg-opacity-5 rounded-lg p-4 mt-4">
        <div class="text-lm font-bold pb-2">
          {{ $t("delivery.deliveryThreshold") }}:
        </div>
        <div class="flex mt-2">
          <b-checkbox
            v-model="enableDeliveryThreshold"
            :disabled="!enableDelivery"
          />
          <span class="flex-item mt-auto mb-auto inline-block mr-2">
            <input
              v-model="deliveryThreshold"
              :disabled="!enableDelivery"
              type="number"
            />
            {{ $t("delivery.yen") }}
          </span>
        </div>
        <div class="text-sm">
          * {{ $t("delivery.deliveryThresholdNotice") }}
        </div>
      </div>

      <div class="bg-black bg-opacity-5 rounded-lg p-4 mt-4">
        <div class="text-lm font-bold pb-2">
          {{ $t("delivery.deliveryFeeSetting") }}
        </div>
        <div class="flex mt-2">
          <span class="flex-item mt-auto mb-auto inline-block mr-2 font-bold">
            {{ $t("delivery.deliveryFee") }}:
          </span>
          <span class="flex-item mt-auto mb-auto inline-block mr-2">
            <input
              v-model="deliveryFee"
              :disabled="!enableDelivery"
              type="number"
            />
            {{ $t("delivery.yen") }}
          </span>
        </div>
        <div class="text-sm">
          * {{ $t("delivery.deliveryFeeSettingNotice") }}
        </div>

        <div class="flex mt-2">
          <b-checkbox
            v-model="enableDeliveryFree"
            :disabled="!enableDelivery"
          />
          <span class="flex-item mt-auto mb-auto inline-block mr-2 font-bold">
            {{ $t("delivery.deliveryFreeThreshold") }}:
          </span>
          <span class="flex-item mt-auto mb-auto inline-block mr-2">
            <input
              v-model="deliveryFreeThreshold"
              :disabled="!enableDelivery"
              type="number"
            />
            {{ $t("delivery.yen") }}
          </span>
        </div>
        <div class="text-sm">
          * {{ $t("delivery.deliveryFreeThresholdNotice") }}
        </div>
      </div>

      <div class="bg-black bg-opacity-5 rounded-lg p-4 mt-4">
        <div class="text-lm font-bold pb-2">
          {{ $t("editRestaurant.deliveryPreparationTime") }}
        </div>
        <div>
          {{ $t("editRestaurant.preparationTime") }}
          {{ $t("delivery.reference") }} {{ shopInfo.pickUpMinimumCookTime }}
          {{ $t("editRestaurant.minutes") }}
        </div>
        <div>* {{ $t("delivery.preparationTimeNotice") }}</div>
        <div>
          {{ $t("editRestaurant.deliveryPreparationTime") }}
          <input
            v-model="deliveryMinimumCookTime"
            :disabled="!enableDelivery"
            type="number"
          />
          {{ $t("editRestaurant.minutes") }}
        </div>
      </div>
      <!-- Save Button -->
      <div class="mt-4 text-center">
        <b-button @click="saveDeliveryArea" class="b-reset-tw">
          <div
            class="h-12 rounded-full bg-op-teal inline-flex justify-center items-center px-6 shadow"
            style="min-width: 8rem"
          >
            <span class="text-white text-base font-bold">{{
              $t("editCommon.save")
            }}</span>
          </div>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { db, firestore } from "@/plugins/firebase";
import NotFound from "@/components/NotFound";

export default {
  components: {
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      enableDelivery: false,
      enableDeliveryFree: false,
      enableDeliveryThreshold: false,
      enableAreaMap: true,
      enableAreaText: false,
      notFound: null,
      deliveryFee: 0,
      deliveryFreeThreshold: 8000,
      deliveryThreshold: 3000,
      deliveryMinimumCookTime: 60,
      markers: [],
      circles: [],
      radius: 500,
      center: null,
      areaText: "",
      existLocation: null,
    };
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
    fillColor() {
      return this.enableAreaMap ? "#ff0000" : "#ffffff";
    },
  },
  watch: {
    enableAreaMap: function () {
      this.updateCircle();
    },
  },
  async created() {
    if (!this.checkAdminPermission()) {
      return;
    }

    if (!this.checkShopAccount(this.shopInfo)) {
      this.notFound = true;
      return true;
    }

    const location = this.shopInfo.location;
    this.existLocation = Object.keys(location).length === 2;
    if (!this.existLocation) {
      return;
    }
    this.enableDelivery = this.shopInfo.enableDelivery || false;
    this.deliveryMinimumCookTime =
      this.shopInfo.deliveryMinimumCookTime || this.deliveryMinimumCookTime;

    const deliveryDoc = await db
      .doc(`restaurants/${this.restaurantId()}/delivery/area`)
      .get();
    if (deliveryDoc.exists) {
      const data = deliveryDoc.data();
      this.enableAreaMap = data.enableAreaMap;
      this.enableAreaText = data.enableAreaText;
      this.enableDeliveryFree =
        data.enableDeliveryFree || this.enableDeliveryFree;
      this.enableDeliveryThreshold =
        data.enableDeliveryThreshold || this.enableDeliveryThreshold;
      this.deliveryFee = data.deliveryFee || this.deliveryFee;
      this.deliveryFreeThreshold =
        data.deliveryFreeThreshold || this.deliveryFreeThreshold;
      this.deliveryThreshold = data.deliveryThreshold || this.deliveryThreshold;
      this.radius = data.radius;
      this.areaText = data.areaText;
    }
    this.center = new google.maps.LatLng(location.lat, location.lng);
    this.mapLoaded();
  },
  mounted() {
    this.mapLoaded();
  },
  methods: {
    async saveDeliveryArea() {
      await db.doc(`restaurants/${this.restaurantId()}`).update({
        enableDelivery: this.enableDelivery,
        deliveryMinimumCookTime: Number(this.deliveryMinimumCookTime || 0),
      });

      const data = {
        enableAreaMap: this.enableAreaMap,
        enableAreaText: this.enableAreaText,
        radius: this.radius,
        areaText: this.areaText,
        enableDeliveryFree: this.enableDeliveryFree,
        enableDeliveryThreshold: this.enableDeliveryThreshold,
        deliveryFee: Number(this.deliveryFee || 0),
        deliveryFreeThreshold: Number(this.deliveryFreeThreshold || 0),
        deliveryThreshold: Number(this.deliveryThreshold || 0),
        uid: this.uid,
      };
      await db
        .doc(`restaurants/${this.restaurantId()}/delivery/area`)
        .set(data);
      this.$router.push("/admin/restaurants/" + this.restaurantId());
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
        strokeColor: "#ff0000",
        strokeOpacity: 1,
        strokeWeight: 1,
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
          map: this.$refs.gMap.map,
        });
        this.removeAllMarker();
        this.markers.push(marker);

        this.maplocation = location;
        this.updateCircle();
      }
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
          circle.setMap(null);
        });
        this.circles = [];
      }
    },
  },
};
</script>
