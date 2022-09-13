<template>
  <div>
    <div class="flex justify-center sm:max-w-7xl mt-6 mx-0 sm:mx-6 xl:mx-auto">
      <img
        :src="moBaseUrl + '/images/assets/mo_hero_mobile.png'"
        class="sm:hidden"
      />
      <img
        :src="moBaseUrl + '/images/assets/mo_hero_tablet.png'"
        class="hidden sm:block"
      />
      <!--ToDo mo-hero-mobileとmo-hero-tablet(breakpoint:smで切り替わる)がここに入ります-->
    </div>

    <div
      class="sm:max-w-7xl sm:text-xl font-bold text-center text-black mt-6 mx-10 xl:mx-auto"
    >
      {{ $t("lp.moTagline") }}
    </div>

    <div
      class="flex justify-center sm:max-w-7xl mt-6 mb-10 mx-6 xl:mx-auto space-x-4"
    >
      <div class="w-full bg-white rounded-lg shadow-none px-4 pb-4 text-center">
        <div class="w-32 h-20 mx-auto mb-4">
          <img :src="moBaseUrl + '/images/assets/mo_icon_shipping.png'" />
        </div>
        <div class="text-sm sm:text-base text-black">
          {{ $t("lp.moDescription1") }}
        </div>
      </div>
      <div class="w-full bg-white rounded-lg shadow-none px-4 pb-4 text-center">
        <div class="w-32 h-20 mx-auto mb-4">
          <img :src="moBaseUrl + '/images/assets/mo_icon_store.png'" />
        </div>
        <div class="text-sm sm:text-base text-black">
          {{ $t("lp.moDescription2") }}
        </div>
      </div>
    </div>

    <div class="text-xl font-bold text-black text-opacity-40 mt-6 mx-6">
      {{ $t("find.shopList") }}
    </div>
    <!-- Restaurants -->
    <template v-for="state in allArea">
      <div v-if="restaurantsObj[state]">
        <div
          class="text-base font-bold text-black text-opacity-40 mt-6 mx-6 mb-2"
        >
          {{ state }}
        </div>
        <div
          class="mt-2 mx-6 grid items-center grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div v-for="restaurant in restaurantsObj[state]">
            <router-link :to="`${moBasePath}/r/${restaurant.id}`">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-black bg-opacity-10 mr-4">
                  <img
                    :src="resizedProfileImage(restaurant, '600')"
                    class="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div class="flex-1 text-base font-bold pr-2">
                  {{ restaurant.restaurantName }}
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "@vue/composition-api";

import { doc2data } from "@/utils/utils";

import { db } from "@/lib/firebase/firebase9";
import {
  getDocs,
  getDoc,
  query,
  collection,
  doc,
  where,
} from "firebase/firestore";

import { JPPrefecture, USStates } from "@/config/constant";
import { restaurant2AreaObj, sortRestaurantObj } from "@/utils/RestaurantUtils";
import { defaultHeader } from "@/config/header";
import { moBaseUrl } from "@/config/project";

export default defineComponent({
  name: "RestaurantIndex",
  metaInfo() {
    return {
      title: [defaultHeader.title, "Restaurant Index"].join(" / "),
    };
  },
  props: {
    moPrefix: {
      type: String,
      required: true,
    },
    moBasePath: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const restaurantsObj = ref({});
    const restaurants = ref([]);

    (async () => {
      const restaurantsCollection = await getDocs(
        query(
          collection(db, "restaurants"),
          where("publicFlag", "==", true),
          where("deletedFlag", "==", false),
          where("groupId", "==", props.moPrefix)
        ),
        (error) => {
          console.log(error);
        }
      );
      const tmp = restaurant2AreaObj(restaurantsCollection.docs);
      restaurantsObj.value = Object.keys(tmp).reduce((ret, key) => {
        const sorted = tmp[key].sort((a, b) => {
          return (Number(a.zip.replace(/\-/g, "")) || 0) >
            (Number(b.zip.replace(/\-/g, "")) || 0)
            ? 1
            : -1;
        });
        // console.log(sorted.map(a => a.zip));
        ret[key] = sorted;
        return ret;
      }, {});
      restaurants.value = restaurantsCollection.docs.map(doc2data(""));
    })();

    const allArea = computed(() => {
      return JPPrefecture.concat(USStates);
    });

    return {
      restaurants,
      restaurantsObj,

      allArea,
      moBaseUrl,
    };
  },
});
</script>
