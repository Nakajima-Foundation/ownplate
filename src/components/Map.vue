<template>
  <div class="mx-6 mt-2 h-3/5">
    <GMapMap
      style="height: 50vh"
      ref="gMap"
      :center="{ lat: center_lat, lng: center_lng }"
      :options="{ fullscreenControl: false }"
      :zoom="zoom"
    >
      <template v-for="(restaurant, k) in restaurants" :key="restaurant.id">
        <GMapMarker
          v-if="restaurant.location && restaurant.location.lat"
          :clickable="true"
          @click="setStore(k)"
          :position="{
            lat: restaurant.location.lat,
            lng: restaurant.location.lng,
          }"
        >
          <GMapInfoWindow :opened="selected === k">
            <div class="text-center">
              <router-link :to="`/r/${restaurant.id}`">
                {{ restaurant.restaurantName }}<br />
                <img
                  :src="resizedProfileImage(restaurant, '600')"
                  class="h-12 w-12 rounded-full object-cover"
                />
              </router-link>
            </div>
          </GMapInfoWindow>
        </GMapMarker>
      </template>
    </GMapMap>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { resizedProfileImage } from "@/utils/utils";

export default defineComponent({
  props: {
    restaurants: {
      type: Array<RestaurantInfoData>,
      required: true,
    },
  },
  setup(props) {
    let max_lat = -1000;
    let max_lng = -1000;
    let min_lat = 1000;
    let min_lng = 1000;

    const center_lat = ref(44.933076);
    const center_lng = ref(15.629058);
    const zoom = ref(13);

    const selected = ref<null | number>(null);

    props.restaurants.map((restaurant: RestaurantInfoData) => {
      if (
        restaurant.location &&
        restaurant.location.lat &&
        restaurant.location.lng
      ) {
        // TODO: filter invalid position data.

        if (restaurant.location.lat > max_lat) {
          max_lat = restaurant.location.lat;
        }
        if (restaurant.location.lng > max_lng) {
          max_lng = restaurant.location.lng;
        }
        if (min_lat > restaurant.location.lat) {
          min_lat = restaurant.location.lat;
        }
        if (min_lng > restaurant.location.lng) {
          min_lng = restaurant.location.lng;
        }
      }
    });
    if (min_lng === 1000 || min_lat === 1000) {
      return {};
    }
    center_lng.value = (max_lng + min_lng) / 2;
    center_lat.value = (max_lat + min_lat) / 2;

    // https://easyramble.com/latitude-and-longitude-per-kilometer.html
    // lat 1 is 111km?
    // lng 1 is 91 km ???
    const lng_dis = Math.abs(max_lng - min_lng) * 91;
    const lat_dis = Math.abs(max_lat - min_lat) * 111;
    const max_dis = Math.max(lng_dis, lat_dis);
    // https://qiita.com/SnowMonkey/items/795779913be692c12a0b
    if (max_dis > 300) {
      zoom.value = 7;
    } else if (max_dis > 100) {
      zoom.value = 8;
    } else if (max_dis > 50) {
      zoom.value = 9;
    } else if (max_dis > 20) {
      zoom.value = 10;
    } else if (max_dis > 10) {
      zoom.value = 11;
    } else if (max_dis > 5) {
      zoom.value = 12;
    } else {
      zoom.value = 13;
    }

    const setStore = (key: number) => {
      selected.value = key;
      console.log(key);
    };
    return {
      center_lat,
      center_lng,
      zoom,

      setStore,
      selected,

      resizedProfileImage,
    };
  },
});
</script>
