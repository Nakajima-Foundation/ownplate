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
            $t("delivery.enableDelivery", { name: shopInfo.restaurantName }, 0)
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
            <GMapMap
              ref="gMap"
              :center="{ lat: 35.6809591, lng: 139.7673068 }"
              :options="{ fullscreenControl: false }"
              :zoom="15"
                style="
                  width: 100%;
                  height: 480px;
                  position: relative;
                  overflow: hidden;
                "
              @loaded="mapLoaded"
            ></GMapMap>
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

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  watch,
} from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { notFoundResponse } from "@/utils/utils";
import NotFound from "@/components/NotFound.vue";

import {
  checkAdminPermission,
  checkShopAccount,
} from "@/utils/userPermission";

import { useRouter } from "vue-router";
import { getRestaurantId, useAdminUids } from "@/utils/utils";

export default defineComponent({
  components: {
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const restaurantId =  getRestaurantId();
    const router = useRouter();
    
    const enableDelivery = ref(false);
    const enableDeliveryFree = ref(false);
    const enableDeliveryThreshold = ref(false);
    const enableAreaMap = ref(true);
    const enableAreaText = ref(false);

    const deliveryFee = ref(0);
    const deliveryFreeThreshold = ref(8000);
    const deliveryThreshold = ref(3000);
    const deliveryMinimumCookTime = ref(60);

    const radius = ref(500);
    const areaText = ref("");
    const existLocation = ref<boolean | null>(null);

    const markers = ref<any[]>([]); //
    const circles = ref<any[]>([]); //
    const center = ref(null); // 
    let maplocation: any = null;
    
    const notFound = ref<boolean | null>(null);
    const gMap = ref();
    
    const {
      ownerUid,
      uid,
    } = useAdminUids();

    if (!checkAdminPermission()) {
      notFound.value = true;
      return notFoundResponse;
    }

    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      notFound.value = true;
      return notFoundResponse;
    }

    const fillColor = computed(() => {
      return enableAreaMap.value ? "#ff0000" : "#ffffff";
    });

    const removeAllMarker = () => {
      if (markers.value && markers.value.length > 0) {
        markers.value.map((marker) => {
          marker.setMap(null);
        });
        markers.value = [];
      }
    };
    const removeAllCircle = () => {
      if (circles.value && circles.value.length > 0) {
        circles.value.map((circle) => {
          circle.setMap(null);
        });
        circles.value = [];
      }
    };

    const updateCircle = async () => {
      removeAllCircle();
      const map = await gMap.value.$mapPromise;
      map.setCenter(maplocation);
      const circle = new google.maps.Circle({
        center: center.value,
        fillColor: fillColor.value,
        fillOpacity: 0.3,
        map: map,
        radius: Number(radius.value),
        strokeColor: "#ff0000",
        strokeOpacity: 1,
        strokeWeight: 1,
      });
      circles.value.push(circle);
    };
    
    const setCurrentLocation = async (location: any) => {
      if (
        gMap.value &&
        gMap.value.$mapPromise &&
        location &&
        location.lat &&
        location.lng
      ) {
        const map = await gMap.value.$mapPromise;
        map.setCenter(location);
        const marker = new google.maps.Marker({
          position: center.value,
          map,
        });
        removeAllMarker();
        markers.value.push(marker);

        maplocation = location;
        updateCircle();
      }
    };

    const mapLoaded = () => {
      if (props.shopInfo && props.shopInfo.location) {
        setCurrentLocation(props.shopInfo.location);
      }
    };
    
    const location = props.shopInfo.location;
    existLocation.value = Object.keys(location).length === 2;
    if (!existLocation.value) {
      return;
    }
    enableDelivery.value = props.shopInfo.enableDelivery || false;
    deliveryMinimumCookTime.value =
      props.shopInfo.deliveryMinimumCookTime || deliveryMinimumCookTime.value;

    getDoc(
      doc(db, `restaurants/${restaurantId}/delivery/area`)
    ).then((deliveryDoc) => {
      if (deliveryDoc.exists()) {
        const data = deliveryDoc.data();
        enableAreaMap.value = data.enableAreaMap;
        enableAreaText.value = data.enableAreaText;
        enableDeliveryFree.value =
          data.enableDeliveryFree || enableDeliveryFree.value;
        enableDeliveryThreshold.value =
          data.enableDeliveryThreshold || enableDeliveryThreshold.value;
        deliveryFee.value = data.deliveryFee || deliveryFee.value;
        deliveryFreeThreshold.value =
          data.deliveryFreeThreshold || deliveryFreeThreshold.value;
        deliveryThreshold.value = data.deliveryThreshold || deliveryThreshold.value;
        radius.value = data.radius;
        areaText.value = data.areaText;
      }
      center.value = new google.maps.LatLng(location.lat, location.lng);
      mapLoaded();
      notFound.value = false;
    });
    onMounted(() => {
      mapLoaded();
    });

    const saveDeliveryArea = async () => {
      await updateDoc(doc(db, `restaurants/${restaurantId}`), {
        enableDelivery: enableDelivery.value,
        deliveryMinimumCookTime: Number(deliveryMinimumCookTime.value || 0),
      });
      const data = {
        enableAreaMap: enableAreaMap.value,
        enableAreaText: enableAreaText.value,
        radius: radius.value,
        areaText: areaText.value,
        enableDeliveryFree: enableDeliveryFree.value,
        enableDeliveryThreshold: enableDeliveryThreshold.value,
        deliveryFee: Number(deliveryFee.value || 0),
        deliveryFreeThreshold: Number(deliveryFreeThreshold.value || 0),
        deliveryThreshold: Number(deliveryThreshold.value || 0),
        uid: uid.value,
      };
      await setDoc(doc(db, `restaurants/${restaurantId}/delivery/area`),data);
      router.push("/admin/restaurants");
    };

    watch(enableAreaMap, () => {
      updateCircle();
    });

    return {
      enableDelivery,
      enableDeliveryFree,
      enableDeliveryThreshold,
      enableAreaMap,
      enableAreaText,
      
      deliveryFee,
      deliveryFreeThreshold,
      deliveryThreshold,
      deliveryMinimumCookTime,

      radius,
      areaText,
      existLocation,

      notFound,

      mapLoaded,
      updateCircle,
      saveDeliveryArea,

      gMap,
    };
    

  },
});
</script>
