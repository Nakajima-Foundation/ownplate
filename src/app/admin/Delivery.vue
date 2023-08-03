<template>
  <div>
    <template v-if="notFound === null"></template>
    <template v-else-if="notFound === true">
      <not-found />
    </template>
    <template v-if="existLocation === false">
      <div class="mx-6 mt-4">
        <div class="rounded-lg bg-black bg-opacity-5 p-4">
          <div class="text-xl font-bold text-red-600">
            <div>
              {{ $t("delivery.alert") }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <div class="mx-6 mt-4" v-else>
      <div class="rounded-lg bg-black bg-opacity-5 p-4">
        <div class="text-sm font-bold">
          <o-checkbox v-model="enableDelivery" />{{
            $tc("delivery.enableDelivery", 0, { name: shopInfo.restaurantName })
          }}
        </div>
      </div>

      <!-- area map -->
      <div class="mt-4 rounded-lg bg-black bg-opacity-5 p-4">
        <div class="text-lm pb-2 font-bold">
          {{ $t("delivery.areaSetting") }}
        </div>

        <div>
          <div class="flex pb-2 text-sm font-bold">
            <o-checkbox v-model="enableAreaMap" :disabled="!enableDelivery" />
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
          <div class="mt-2 flex">
            <span class="flex-item mt-auto mb-auto mr-2 inline-block">
              {{ $t("delivery.deliveryRange") }}:
            </span>
            <span class="flex-item mt-auto mb-auto mr-2 inline-block">
              <input
                v-model="radius"
                :disabled="!enableAreaMap || !enableDelivery"
              />
              m
            </span>
            <o-button
              class="b-reset-tw"
              :disabled="!enableAreaMap || !enableDelivery"
              @click="updateCircle"
            >
              <div
                class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
              >
                <span class="text-base font-bold text-white">
                  {{ $t("delivery.updateDeliveryRange") }}
                </span>
              </div>
            </o-button>
          </div>
        </div>
        <!-- area text -->
        <div class="mt-4">
          <div class="flex pb-2 text-sm font-bold">
            <o-checkbox v-model="enableAreaText" :disabled="!enableDelivery" />
            {{ $t("delivery.setAreaText") }}
          </div>

          <o-input
            v-model="areaText"
            type="textarea"
            :placeholder="$t('delivery.areaTextExample')"
            :disabled="!enableAreaText || !enableDelivery"
          >
          </o-input>
        </div>
      </div>

      <div class="mt-4 rounded-lg bg-black bg-opacity-5 p-4">
        <div class="text-lm pb-2 font-bold">
          {{ $t("delivery.deliveryThreshold") }}:
        </div>
        <div class="mt-2 flex">
          <o-checkbox
            v-model="enableDeliveryThreshold"
            :disabled="!enableDelivery"
          />
          <span class="flex-item mt-auto mb-auto mr-2 inline-block">
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

      <div class="mt-4 rounded-lg bg-black bg-opacity-5 p-4">
        <div class="text-lm pb-2 font-bold">
          {{ $t("delivery.deliveryFeeSetting") }}
        </div>
        <div class="mt-2 flex">
          <span class="flex-item mt-auto mb-auto mr-2 inline-block font-bold">
            {{ $t("delivery.deliveryFee") }}:
          </span>
          <span class="flex-item mt-auto mb-auto mr-2 inline-block">
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

        <div class="mt-2 flex">
          <o-checkbox
            v-model="enableDeliveryFree"
            :disabled="!enableDelivery"
          />
          <span class="flex-item mt-auto mb-auto mr-2 inline-block font-bold">
            {{ $t("delivery.deliveryFreeThreshold") }}:
          </span>
          <span class="flex-item mt-auto mb-auto mr-2 inline-block">
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

      <div class="mt-4 rounded-lg bg-black bg-opacity-5 p-4">
        <div class="text-lm pb-2 font-bold">
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
      <div class="mt-4 rounded-lg bg-black bg-opacity-5 p-4">
        <a
          href="https://docs.omochikaeri.com/manuals/delivery.pdf"
          target="_blank"
          class="inline-flex items-center justify-center text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t("menu.deliveryManualLink") }}
        </a>
      </div>
      <!-- Save Button -->
      <div class="mt-4 text-center">
        <o-button @click="saveDeliveryArea" class="b-reset-tw">
          <div
            class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
            style="min-width: 8rem"
          >
            <span class="text-base font-bold text-white">{{
              $t("editCommon.save")
            }}</span>
          </div>
        </o-button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { notFoundResponse } from "@/utils/utils";
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
    ownerUid() {
      return this.$store.getters.isSubAccount
        ? this.$store.getters.parentId
        : this.$store.getters.uidAdmin;
    },
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
      this.notFound = true;
      return notFoundResponse;
    }

    if (!this.checkShopAccount(this.shopInfo)) {
      this.notFound = true;
      return notFoundResponse;
    }

    const location = this.shopInfo.location;
    this.existLocation = Object.keys(location).length === 2;
    if (!this.existLocation) {
      return;
    }
    this.enableDelivery = this.shopInfo.enableDelivery || false;
    this.deliveryMinimumCookTime =
      this.shopInfo.deliveryMinimumCookTime || this.deliveryMinimumCookTime;

    const deliveryDoc = await getDoc(
      doc(db, `restaurants/${this.restaurantId()}/delivery/area`)
    )
    if (deliveryDoc.exists()) {
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
    this.notFound = false;
  },
  mounted() {
    this.mapLoaded();
  },
  methods: {
    checkAdminPermission() {
      if (!this.$store.getters.uidAdmin) {
        const redirectUrl = encodeURIComponent(this.$route.path);
        if (redirectUrl) {
          this.$router.replace("/admin/user/signin?to=" + redirectUrl);
        } else {
          this.$router.replace("/admin/user/signin");
        }
        return false;
      }
      return true;
    },
    checkShopAccount(shopInfo) {
      return shopInfo.uid === this.ownerUid;
    },
    async saveDeliveryArea() {
      await updateDoc(doc(db, `restaurants/${this.restaurantId()}`), {
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
      await setDoc(doc(db, `restaurants/${this.restaurantId()}/delivery/area`),data);
      this.$router.push("/admin/restaurants");
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
