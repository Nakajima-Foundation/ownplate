<template>
  <div>
    <div class="mx-6 mt-4">
      <router-link :to="'/r'">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">list</i>
          <span class="text-sm font-bold text-op-teal">{{
            $t("find.areaTop")
          }}</span>
        </div>
      </router-link>
    </div>

    <div class="mx-6 mt-4 text-xl font-bold text-black/40">
      {{ areaName }}
    </div>

    <!-- Restaurants -->
    <div
      class="mx-6 mt-2 grid grid-cols-1 items-center gap-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div v-for="(restaurant, k) in restaurants" :key="k">
        <router-link :to="`/r/${restaurant.id}`">
          <div class="flex items-center">
            <div class="mr-4 h-12 w-12 rounded-full bg-black/10">
              <img
                :src="resizedProfileImage(restaurant, '600')"
                class="h-12 w-12 rounded-full object-cover"
              />
            </div>
            <div class="flex-1 pr-2 text-base font-bold">
              {{ restaurant.restaurantName }}
              <i
                class="material-icons align-middle"
                v-if="restaurant.enableDelivery"
              >
                delivery_dining
              </i>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <div class="mx-6 mt-2 h-3/5">
      <AreaMap :restaurants="restaurants" v-if="restaurants.length > 0" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { getDocs, collection, where, query } from "firebase/firestore";

import { defaultHeader } from "@/config/header";
import AreaMap from "@/components/Map.vue";

import { regionalSetting, resizedProfileImage } from "@/utils/utils";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    AreaMap,
  },
  setup() {
    const route = useRoute();
    const { t } = useI18n();

    const areaId = route.params.areaId as string;
    const areaName = regionalSetting.AddressStates[areaId];

    useHead(() => ({
      title: [
        t("pageTitle.restaurantArea", { area: areaName }, 0),
        defaultHeader.title,
      ].join(" / "),
    }));

    const restaurants = ref<RestaurantInfoData[]>([]);
    if (areaName) {
      getDocs(
        query(
          collection(db, "restaurants"),
          where("publicFlag", "==", true),
          where("deletedFlag", "==", false),
          where("onTheList", "==", true),
          where("state", "==", areaName),
        ),
      ).then((res) => {
        restaurants.value = (res.docs || [])
          .map((doc) => {
            const data = doc.data();
            data.id = doc.id;
            return data as RestaurantInfoData;
          })
          .sort((a, b) => {
            return a.restaurantName > b.restaurantName ? 1 : -1;
          });
      });
    }
    return {
      areaName,
      restaurants,
      resizedProfileImage,
    };
  },
});
</script>
