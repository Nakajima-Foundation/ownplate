<template>
    <GMapMap
      ref="gMap"
      :center="{ lat: center_lat, lng: center_lng }"
      :options="{ fullscreenControl: false }"
      :zoom="zoom"
      style="width: 100%; height: 100%"
    >
      <template v-for="(restaurant, key) in restaurants"
                :key="key">
        <GMapMarker :position="{lat: restaurant.location.lat, lng: restaurant.location.lng}"
                    @click="selectRestaurant(key)"
                    v-if="restaurant.location && restaurant.location.lat && restaurant.location.lng"
                    >
          <GMapInfoWindow
            :opened="selectedRestaurant === key"
            >
            <div class="text-center">
              <router-link :to="`/r/${restaurant.id}`">
                {{restaurant.restaurantName}}<br/>
                <img
                  :src="resizedProfileImage(restaurant, '600')"
                  class="w-12 h-12 rounded-full object-cover "
                  />
              </router-link>
            </div>
          </GMapInfoWindow>
        </GMapMarker>
      </template>
    </GMapMap>
</template>

<script>
import { defineComponent, ref } from "vue";
export default defineComponent({
  props: {
    restaurants: {
      type: Array,
      required: true
    },
  },
  setup(props) {
    const selectedRestaurant = ref(null);

    let max_lat = -1000;
    let max_lng = -1000;
    let min_lat = 1000;
    let min_lng = 1000;
    let center_lat = 44.933076
    let center_lng = 15.629058;
    let zoom = 13;
    props.restaurants.map((restaurant) => {
      if (restaurant.location) {
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
      return;
    }
    center_lng = (max_lng + min_lng) / 2;
    center_lat = (max_lat + min_lat) / 2;

    // https://easyramble.com/latitude-and-longitude-per-kilometer.html
    // lat 1 is 111km?
    // lng 1 is 91 km ???
    const lng_dis = Math.abs (max_lng - min_lng) * 91;
    const lat_dis = Math.abs (max_lat- min_lat) * 111;
    const max_dis = Math.max(lng_dis, lat_dis);
    // https://qiita.com/SnowMonkey/items/795779913be692c12a0b
    if (max_dis > 300) {
      zoom = 7;
    } else if (max_dis > 100) {
      zoom = 8;
    } else if (max_dis > 50) {
      zoom = 9;
    } else if (max_dis > 20) {
      zoom = 10;
    } else if (max_dis > 10) {
      zoom = 11;
    } else if (max_dis > 5) {
      zoom = 12;
    } else {
      zoom = 13;
    }
    const selectRestaurant = (key) => {
      console.log(key);
      selectedRestaurant.value = key;
    };
    return {
      selectRestaurant,
      center_lat,
      center_lng,
      zoom,
      selectedRestaurant,
    };
  },
});
</script>
