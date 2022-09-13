<template>
  <div>
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
          return (Number(a.zip.replace(/\-/g, "")) || 0) > (Number(b.zip.replace(/\-/g, "")) || 0 ) ? 1 : -1;
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
    };
  },
});
</script>
