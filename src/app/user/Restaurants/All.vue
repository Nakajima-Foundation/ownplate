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

<script>
import { db } from "@/plugins/firebase";
import { RestaurantHeader } from "@/config/header";
import { JPPrefecture, USStates } from "@/config/constant";
import { restaurant2AreaObj, sortRestaurantObj } from "@/utils/RestaurantUtils";

export default {
  components: {},
  data() {
    return {
      restaurantsObj: [],
    };
  },
  computed: {
    allArea() {
      return JPPrefecture.concat(USStates);
    },
  },
  metaInfo() {
    return RestaurantHeader;
  },
  async created() {
    try {
      const res = await db
        .collection("restaurants")
        .where("publicFlag", "==", true)
        .where("deletedFlag", "==", false)
        .where("onTheList", "==", true)
        .get();
      const restaurants = res.docs || [];
      this.restaurantsObj = restaurant2AreaObj(restaurants);
      sortRestaurantObj(this.restaurantsObj);
    } catch (error) {
      console.log(error);
    }
  },
};
</script>
