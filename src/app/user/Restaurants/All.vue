<template>
  <div>
    <div class="mx-6 mt-6">
      <router-link :to="'/r'">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">list</i>
          <span class="text-sm font-bold text-op-teal">{{
            $t("find.areaTop")
          }}</span>
        </div>
      </router-link>
    </div>

    <div class="mx-6 mt-6 text-xl font-bold text-black text-opacity-40">
      {{ $t("find.areaAll") }}
    </div>

    <!-- Restaurants -->
    <template v-for="state in allArea">
      <div v-if="restaurantsObj[state]">
        <div
          class="mx-6 mt-6 mb-2 text-base font-bold text-black text-opacity-40"
        >
          {{ state }}
        </div>
        <div
          class="mx-6 mt-2 grid grid-cols-1 items-center gap-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div v-for="restaurant in restaurantsObj[state]">
            <router-link :to="`/r/${restaurant.id}`">
              <div class="flex items-center">
                <div class="mr-4 h-12 w-12 rounded-full bg-black bg-opacity-10">
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
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { db } from "@/lib/firebase/firebase9";
import { getDocs, collection, where, limit, query } from "firebase/firestore";

import { RestaurantHeader } from "@/config/header";
import { JPPrefecture } from "@/config/constant";
import { restaurant2AreaObj, sortRestaurantObj } from "@/utils/RestaurantUtils";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { resizedProfileImage } from "@/utils/utils";

export default defineComponent({
  metaInfo() {
    return RestaurantHeader as any;
  },
  setup() {
    const allArea = JPPrefecture;

    const restaurantsObj = ref<{[key: string]: RestaurantInfoData[]}>({});
    getDocs(
      query(
        collection(db, "restaurants"),
        where("publicFlag", "==", true),
        where("deletedFlag", "==", false),
        where("onTheList", "==", true)
      )
    )
      .then((res) => {
        const restaurants = res.docs || [];
        restaurantsObj.value = restaurant2AreaObj(restaurants);
        sortRestaurantObj(restaurantsObj.value);
      })
      .catch((error) => {
        console.log(error);
      });
    return {
      restaurantsObj,
      allArea,
      resizedProfileImage,
    };
  },
});
</script>
