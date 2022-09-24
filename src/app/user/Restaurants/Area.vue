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
      {{ areaName }}
    </div>

    <!-- Restaurants -->
    <div
      class="mx-6 mt-2 grid grid-cols-1 items-center gap-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div v-for="restaurant in restaurants">
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

    <div class="mx-6 mt-2 h-3/5">
      <Map :restaurants="restaurants" v-if="restaurants.length > 0" />
    </div>
  </div>
</template>

<script>
import { db } from "@/plugins/firebase";
import { defaultHeader } from "../../../config/header";
import Map from "@/components/Map";

export default {
  components: {
    Map,
  },
  metaInfo() {
    return {
      title: [
        this.$tc("pageTitle.restaurantArea", 0, { area: this.areaName }),
        defaultHeader.title,
      ].join(" / "),
    };
  },
  data() {
    return {
      areaName: "",
      restaurants: [],
    };
  },
  methods: {
    areaId() {
      return this.$route.params.areaId;
    },
  },
  async created() {
    this.areaName = this.regionalSetting.AddressStates[this.areaId()];
    if (this.areaName) {
      const res = await db
        .collection("restaurants")
        .where("publicFlag", "==", true)
        .where("deletedFlag", "==", false)
        .where("onTheList", "==", true)
        .where("state", "==", this.areaName)
        .get();
      this.restaurants = (res.docs || [])
        .map((doc) => {
          const data = doc.data();
          data.id = doc.id;
          return data;
        })
        .sort((a, b) => {
          return a.restaurantName > b.restaurantName ? 1 : -1;
        });
    }
  },
};
</script>
