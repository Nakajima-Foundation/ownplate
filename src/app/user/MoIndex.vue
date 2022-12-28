<template>
  <div>
    <div class="mx-0 mt-6 flex justify-center sm:mx-6 sm:max-w-7xl xl:mx-auto">
      <img
        :src="moBaseUrl + '/images/assets/mo_hero_mobile.png'"
        class="sm:hidden"
      />
      <img
        :src="moBaseUrl + '/images/assets/mo_hero_tablet.png'"
        class="hidden sm:block"
      />
    </div>

    <div
      class="mx-10 mt-6 text-center font-bold text-black sm:max-w-7xl sm:text-xl xl:mx-auto"
    >
      {{ $t("lp.moTagline") }}
    </div>

    <div
      class="mx-6 mt-6 mb-10 flex justify-center space-x-4 sm:max-w-7xl xl:mx-auto"
    >
      <!-- pickup -->
      <div class="w-full rounded-lg bg-white px-4 pb-4 text-left shadow-none">
        <div class="mx-auto mb-4 h-20 w-32">
          <img :src="moBaseUrl + '/images/assets/mo_icon_store.png'" />
        </div>
        <div class="text-sm text-black sm:text-base">
          {{ $t("lp.moDescription2") }}
        </div>
        <div class="mt-0.5 text-xs text-black text-opacity-60 sm:text-sm">
          {{ $t("lp.moDescription3") }}
        </div>
      </div>
      <!-- takeout -->
      <div class="w-full rounded-lg bg-white px-4 pb-4 text-left shadow-none">
        <div class="mx-auto mb-4 h-20 w-32">
          <img :src="moBaseUrl + '/images/assets/mo_icon_shipping.png'" />
        </div>
        <div class="text-sm text-black sm:text-base">
          {{ $t("lp.moDescription1") }}
        </div>
      </div>
    </div>

    <div class="mx-6 mt-6 text-xl font-bold text-black text-opacity-40">
      {{ $t("find.shopList") }}
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
            <router-link :to="`${moBasePath}/r/${restaurant.id}`">
              <div class="flex items-center">
                <div class="mr-4 h-12 w-12 rounded-full bg-black bg-opacity-10">
                  <img
                    :src="resizedProfileImage(restaurant, '600')"
                    class="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <div>
                  <div class="flex-1 pr-2 text-base font-bold">
                    {{ restaurant.restaurantName }}
                    <span v-if="restaurant.moCloseDate" class="text-xs font-bold">{{
                      $tc("mobileOrder.closeLabel", 0, {date: moment(restaurant.moCloseDate.toDate()).format('M/D') })
                    }}</span>
                  </div>
                  <div
                    v-if="restaurant.enableMoPickup"
                    class="w-28 rounded-md bg-green-600 bg-opacity-10 py-0.5 text-center text-xs font-bold text-green-600"
                  >
                    {{ $t("mobileOrder.pickupLabel") }}
                  </div>
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
import { moBaseUrl, moTitle } from "@/config/project";

import { useIsInMo } from "@/utils/utils";

export default defineComponent({
  name: "RestaurantIndex",
  metaInfo() {
    return {
      title: (this.isInMo
        ? [moTitle, this.$t("find.shopList")]
        : [defaultHeader.title, "Restaurant Index"]
      ).join(" / "),
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
    const isInMo = useIsInMo(ctx.root);

    const restaurantsObj = ref({});
    const restaurants = ref([]);

    (async () => {
      const restaurantsCollection = await getDocs(
        query(
          collection(db, "restaurants"),
          where("publicFlag", "==", true),
          where("inMoIndex", "==", true),
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

      isInMo,
    };
  },
});
</script>
