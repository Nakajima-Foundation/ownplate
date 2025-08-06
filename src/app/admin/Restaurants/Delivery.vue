<template>
  <div>
    <template v-if="notFound === null"></template>
    <template v-else-if="notFound === true">
      <not-found />
    </template>
    <template v-else-if="existLocation === false">
      <div class="mx-6 mt-4">
        <div class="rounded-lg bg-black/5 p-4">
          <div class="text-xl font-bold text-red-600">
            <div>
              {{ $t("delivery.alert") }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="mx-6 mt-4">
        <!-- Save and Cancel -->
        <div class="mt-2 flex justify-center space-x-4">
          <!-- Cancel Button -->
          <router-link :to="`/admin/restaurants/#restaurant_` + restaurantId">
            <div
              class="inline-flex h-12 items-center rounded-full bg-black/5 px-6"
            >
              <span class="text-base font-bold text-black/60">{{
                $t("button.cancel")
              }}</span>
            </div>
          </router-link>

          <t-button
            @click="saveDeliveryArea"
            class="h-12 w-32 font-bold text-white"
          >
            {{ $t("editCommon.save") }}
          </t-button>
        </div>

        <div class="mt-4 rounded-lg bg-black/5 p-4">
          <div class="text-sm font-bold">
            <Checkbox class="content-center pr-2" v-model="enableDelivery"
              >{{
                $t(
                  "delivery.enableDelivery",
                  { name: shopInfo.restaurantName },
                  0,
                )
              }}
            </Checkbox>
          </div>
          <div class="text-sm font-bold">
            <Checkbox class="content-center pr-2" v-model="deliveryOnlyStore"
              >{{
                $t(
                  "delivery.deliveryOnlyStore",
                  { name: shopInfo.restaurantName },
                  0,
                )
              }}
            </Checkbox>
          </div>
        </div>

        <!-- area map -->
        <div class="mt-4 rounded-lg bg-black/5 p-4">
          <div class="text-lm pb-2 font-bold">
            {{ $t("delivery.areaSetting") }}
          </div>

          <div>
            <div class="flex pb-2 text-sm font-bold">
              <Checkbox
                class="content-center pr-2"
                v-model="enableAreaMap"
                :disabled="!enableDelivery"
              >
                {{ $t("delivery.setAreaMap") }}
              </Checkbox>
            </div>
            <div>
              <span>{{ $t("delivery.setAreaMapNotice") }}</span>
            </div>
            <div>
              <div
                ref="mapContainer"
                style="
                  width: 100%;
                  height: 480px;
                  position: relative;
                  overflow: hidden;
                "
              ></div>
            </div>
            <div class="mt-2 flex">
              <span class="flex-item mt-auto mr-2 mb-auto inline-block">
                {{ $t("delivery.deliveryRange") }}:
              </span>
              <span class="flex-item mt-auto mr-2 mb-auto inline-block">
                <input
                  class="rounded-lg border border-black/20 bg-white px-4 py-1 dark:bg-black dark:text-gray-200"
                  v-model="radius"
                  :disabled="!enableAreaMap || !enableDelivery"
                />
                m
              </span>
              <t-button
                class="h-12 px-6 font-bold text-white"
                :isDisabled="!enableAreaMap || !enableDelivery"
                @click="updateCircle"
              >
                {{ $t("delivery.updateDeliveryRange") }}
              </t-button>
            </div>
          </div>
          <!-- area text -->
          <div class="mt-4">
            <div class="flex pb-2 text-sm font-bold">
              <Checkbox
                class="content-center pr-2"
                v-model="enableAreaText"
                :disabled="!enableDelivery"
              >
                {{ $t("delivery.setAreaText") }}
              </Checkbox>
            </div>

            <textarea
              v-model="areaText"
              :placeholder="$t('delivery.areaTextExample')"
              :disabled="!enableAreaText || !enableDelivery"
              class="resize-vertical w-full rounded-lg border border-gray-300 px-3 py-2 dark:bg-black dark:text-gray-200"
              rows="4"
            >
            </textarea>
          </div>
        </div>

        <div class="mt-4 rounded-lg bg-black/5 p-4">
          <div class="text-lm pb-2 font-bold">
            {{ $t("delivery.deliveryThreshold") }}:
          </div>
          <div class="mt-2 flex">
            <Checkbox
              class="content-center pr-2"
              v-model="enableDeliveryThreshold"
              :disabled="!enableDelivery"
            />
            <span class="flex-item mt-auto mr-2 mb-auto inline-block">
              <input
                class="rounded-lg border border-black/20 bg-white px-4 py-1 dark:bg-black dark:text-gray-200"
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

        <div class="mt-4 rounded-lg bg-black/5 p-4">
          <div class="text-lm pb-2 font-bold">
            {{ $t("delivery.deliveryFeeSetting") }}
          </div>
          <div class="mt-2 flex">
            <span class="flex-item mt-auto mr-2 mb-auto inline-block font-bold">
              {{ $t("delivery.deliveryFee") }}:
            </span>
            <span class="flex-item mt-auto mr-2 mb-auto inline-block">
              <input
                class="rounded-lg border border-black/20 bg-white px-4 py-1 dark:bg-black dark:text-gray-200"
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
              rootClass="content-center pr-2"
              v-model="enableDeliveryFree"
              :disabled="!enableDelivery"
            />
            <span class="flex-item mt-auto mr-2 mb-auto inline-block font-bold">
              {{ $t("delivery.deliveryFreeThreshold") }}:
            </span>
            <span class="flex-item mt-auto mr-2 mb-auto inline-block">
              <input
                class="rounded-lg border border-black/20 bg-white px-4 py-1 dark:bg-black dark:text-gray-200"
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

        <div class="mt-4 rounded-lg bg-black/5 p-4">
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
              class="rounded-lg border border-black/20 bg-white px-4 py-1 dark:bg-black dark:text-gray-200"
              v-model="deliveryMinimumCookTime"
              :disabled="!enableDelivery"
              type="number"
            />
            {{ $t("editRestaurant.minutes") }}
          </div>
        </div>
        <div class="mt-4 rounded-lg bg-black/5 p-4">
          <a
            href="https://docs.omochikaeri.com/manuals/delivery.pdf"
            target="_blank"
            class="text-op-teal inline-flex items-center justify-center text-sm font-bold"
          >
            {{ $t("menu.deliveryManualLink") }}
          </a>
        </div>

        <!-- Save and Cancel -->
        <div class="mt-2 flex justify-center space-x-4">
          <!-- Cancel Button -->
          <router-link :to="`/admin/restaurants/#restaurant_` + restaurantId">
            <div
              class="inline-flex h-12 items-center rounded-full bg-black/5 px-6"
            >
              <span class="text-base font-bold text-black/60">{{
                $t("button.cancel")
              }}</span>
            </div>
          </router-link>

          <t-button
            @click="saveDeliveryArea"
            class="h-12 w-32 font-bold text-white"
          >
            {{ $t("editCommon.save") }}
          </t-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { GMAPId } from "@/config/project";

import { checkAdminPermission, checkShopAccount } from "@/utils/userPermission";
import { useRouter } from "vue-router";
import { getRestaurantId, useAdminUids, notFoundResponse } from "@/utils/utils";

import Checkbox from "@/components/form/checkbox.vue";
import NotFound from "@/components/NotFound.vue";

export default defineComponent({
  components: {
    NotFound,
    Checkbox,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const restaurantId = getRestaurantId();
    const router = useRouter();

    const enableDelivery = ref(false);
    const deliveryOnlyStore = ref(false);
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

    const markers = ref<any[]>([]);
    const circles = ref<any[]>([]);
    const center = ref<google.maps.LatLng | null>(null);
    const notFound = ref<boolean | null>(null);

    const mapContainer = ref<HTMLDivElement | null>(null);
    let map: google.maps.Map | null = null;

    const { ownerUid, uid } = useAdminUids();

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
      markers.value.forEach((marker) => marker.setMap(null));
      markers.value = [];
    };

    const removeAllCircle = () => {
      circles.value.forEach((circle) => circle.setMap(null));
      circles.value = [];
    };

    const updateCircle = () => {
      if (!map || !center.value) return;
      removeAllCircle();
      map.setCenter(center.value);
      const circle = new google.maps.Circle({
        center: center.value,
        fillColor: fillColor.value,
        fillOpacity: 0.3,
        map,
        radius: Number(radius.value),
        strokeColor: "#ff0000",
        strokeOpacity: 1,
        strokeWeight: 1,
      });
      circles.value.push(circle);
    };

    const setCurrentLocation = (location: any) => {
      if (!map || !location?.lat || !location?.lng) return;

      center.value = new google.maps.LatLng(location.lat, location.lng);
      map.setCenter(center.value);

      removeAllMarker();
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: center.value,
        map,
      });
      markers.value.push(marker);

      updateCircle();
    };

    const mapLoaded = () => {
      setTimeout(() => {
        if (!mapContainer.value) return;

        if (!map) {
          const loc = props.shopInfo.location;
          map = new google.maps.Map(mapContainer.value, {
            center: { lat: loc.lat, lng: loc.lng },
            zoom: 15,
            fullscreenControl: false,
            mapId: GMAPId || undefined,
          });
        }
        if (typeof google !== "undefined") {
          const loc = props.shopInfo.location;
          center.value = new google.maps.LatLng(loc.lat, loc.lng);
          setCurrentLocation(loc);
        }
      }, 100);
    };

    onMounted(() => {
      mapLoaded();
    });

    const location = props.shopInfo.location;
    existLocation.value = Object.keys(location).length === 2;
    if (!existLocation.value) {
      return { notFound: false, existLocation };
    }

    enableDelivery.value = props.shopInfo.enableDelivery || false;
    deliveryOnlyStore.value = props.shopInfo.deliveryOnlyStore || false;
    deliveryMinimumCookTime.value =
      props.shopInfo.deliveryMinimumCookTime || deliveryMinimumCookTime.value;

    getDoc(doc(db, `restaurants/${restaurantId}/delivery/area`)).then(
      (deliveryDoc) => {
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
          deliveryThreshold.value =
            data.deliveryThreshold || deliveryThreshold.value;
          radius.value = data.radius;
          areaText.value = data.areaText;
        }
        mapLoaded();
        notFound.value = false;
      },
    );

    const saveDeliveryArea = async () => {
      await updateDoc(doc(db, `restaurants/${restaurantId}`), {
        enableDelivery: enableDelivery.value,
        deliveryOnlyStore: deliveryOnlyStore.value,
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
      await setDoc(doc(db, `restaurants/${restaurantId}/delivery/area`), data);
      router.push("/admin/restaurants#restaurant_" + restaurantId);
    };

    watch(enableAreaMap, () => {
      updateCircle();
    });

    return {
      enableDelivery,
      deliveryOnlyStore,
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
      restaurantId,

      notFound,

      mapLoaded,
      updateCircle,
      saveDeliveryArea,

      mapContainer,
    };
  },
});
</script>
