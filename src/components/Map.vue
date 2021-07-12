<template>
  <div
    class="mt-2 mx-6 h-3/5"
    >
    <GMap
      ref="gMap"
      :center="{ lat: center_lat, lng: center_lng }"
      :options="{ fullscreenControl: false }"
      :zoom="zoom"
      @loaded="mapLoaded"
    >
      <GMapMarker v-for="restaurant in restaurants"
                  :key="restaurant.id"
                  :position="{lat: restaurant.location.lat, lng: restaurant.location.lng}"
                  >
        <GMapInfoWindow>
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

    </GMap>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  props: {
    restaurants: {
      type: Array,
      required: true
    },

  },
  data() {
    return {
      max_lat: -1000,
      max_lng: -1000,
      min_lat: 1000,
      min_lng: 1000,
      center_lat: 44.933076,
      center_lng: 15.629058,
      zoom: 13,
    };
  },
  methods: {
    mapLoaded() {
      }
  },
  created() {
    console.log(this.restaurants);
    this.restaurants.map((restaurant) => {
      if (restaurant.location) {
        console.log(restaurant.location.lat,
                    restaurant.location.lng)
        if (restaurant.location.lat > this.max_lat) {
          this.max_lat = restaurant.location.lat;
        }
        if (restaurant.location.lng > this.max_lng) {
          this.max_lng = restaurant.location.lng;
        }
        if (this.min_lat > restaurant.location.lat) {
          this.min_lat = restaurant.location.lat;
        }
        if (this.min_lng > restaurant.location.lng) {
          this.min_lng = restaurant.location.lng;
        }
      }
    });
    if (this.min_lng !== 1000) {
      this.center_lng = (this.max_lng + this.min_lng) / 2;
    }
    if (this.min_lat !== 1000) {
      this.center_lat = (this.max_lat + this.min_lat) / 2;
    }

    // https://easyramble.com/latitude-and-longitude-per-kilometer.html
    // lat 1 is 111km?
    // lng 1 is 91 km ???
    const lng_dis = Math.abs (this.max_lng - this.min_lng) * 91;
    const lat_dis = Math.abs (this.max_lat- this.min_lat) * 111;
    const max_dis = Math.max(lng_dis, lat_dis);
    // https://qiita.com/SnowMonkey/items/795779913be692c12a0b
    if (max_dis > 300) {
      this.zoom = 7;
    } else if (max_dis > 100) {
      this.zoom = 8;
    } else if (max_dis > 50) {
      this.zoom = 9;
    } else if (max_dis > 20) {
      this.zoom = 10;
    } else if (max_dis > 10) {
      this.zoom = 11;
    } else if (max_dis > 5) {
      this.zoom = 12;
    } else {
      this.zoom = 13;
    }

  },
}
</script>
