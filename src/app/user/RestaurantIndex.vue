<template>
  <div>
    <!-- Restaurants -->
    <div v-if="ownerData.name">
      <div class="grid grid-cols-1">
        <!-- Left -->
        <div>
          <!-- Cover Image -->
          <div>
            <img
              :src="coverImage"
              class="h-48 w-full object-cover lg:rounded-lg"
            />
          </div>
        </div>
      </div>

      <!-- For Responsible  -->
      <div class="mx-6 lg:mx-0">
        <div class="mt-4">
          <div class="mt-2 text-center text-xl font-bold">
            {{ ownerData.name }}
          </div>
        </div>

        <div class="mt-2 text-base">
          {{ ownerData.description }}
        </div>
      </div>
    </div>
    <template v-for="(state, k) in allArea" :key="k">
      <div v-if="restaurantsObj[state]">
        <div
          class="mx-6 mt-2 mb-2 text-base font-bold text-black/40"
        >
          {{ state }}
        </div>
        <div
          class="mx-6 mt-2 grid grid-cols-1 items-center gap-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div v-for="(restaurant, k2) in restaurantsObj[state]" :key="k2">
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
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </template>
    <div>
      <MapView :restaurants="restaurants" v-if="restaurants.length > 0" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

import { doc2data, resizedProfileImage } from "@/utils/utils";

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
import MapView from "@/components/Map.vue";
import { defaultHeader } from "@/config/header";

import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { OwnerData } from "@/models/ownerData";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";

export default defineComponent({
  name: "RestaurantIndex",
  components: {
    MapView,
  },

  setup() {
    const route = useRoute();
    const ownerUid = route.params.ownerUid;

    const restaurantsObj = ref({});
    const restaurants = ref<RestaurantInfoData[]>([]);
    const ownerData = ref<OwnerData>({});

    useHead({
      title: [defaultHeader.title, "Restaurant Index"].join(" / "),
    });

    (async () => {
      const restaurantsCollection = await getDocs(
        query(
          collection(db, "restaurants"),
          where("publicFlag", "==", true),
          where("deletedFlag", "==", false),
          where("onTheList", "==", true),
          where("uid", "==", ownerUid),
        ),
      );
      restaurantsObj.value = restaurant2AreaObj(restaurantsCollection.docs);
      restaurants.value = restaurantsCollection.docs.map(
        doc2data(""),
      ) as RestaurantInfoData[];
      sortRestaurantObj(restaurantsObj.value);

      const ownerDoc = await getDoc(doc(db, `owners/${ownerUid}`));
      ownerData.value = ownerDoc.data() || {};
    })();

    const allArea = computed(() => {
      return JPPrefecture.concat(USStates);
    });
    const coverImage = computed(() => {
      return (
        (ownerData.value?.images?.cover?.resizedImages || {})["1200"] ||
        ownerData.value?.restCoverPhoto
      );
    });

    return {
      restaurants,
      restaurantsObj,
      ownerData,

      allArea,
      coverImage,

      resizedProfileImage,
    };
  },
});
</script>
