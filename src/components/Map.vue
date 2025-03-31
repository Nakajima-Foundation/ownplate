<template>
  <div class="mx-6 mt-2 h-3/5">
    <div ref="mapRef" class="w-full h-[50vh]"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from "vue";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { resizedProfileImage } from "@/utils/utils";
import { GAPIKey, GMAPId } from "@/config/project";
import { GOOGLE_MAP_DEFAULT_CENTER } from "@/config/constant";

export default defineComponent({
  props: {
    restaurants: {
      type: Array as PropType<RestaurantInfoData[]>,
      required: true,
    },
  },
  setup(props) {
    const mapRef = ref<HTMLElement | null>(null);
    const mapObj = ref<google.maps.Map | null>(null);
    const info_windows: google.maps.InfoWindow[] = [];

    const center_lat = ref(GOOGLE_MAP_DEFAULT_CENTER.lat);
    const center_lng = ref(GOOGLE_MAP_DEFAULT_CENTER.lng);
    const zoom = ref(13);

    let max_lat = -1000;
    let max_lng = -1000;
    let min_lat = 1000;
    let min_lng = 1000;

    props.restaurants.forEach((restaurant: RestaurantInfoData) => {
      const loc = restaurant.location;
      if (loc?.lat && loc?.lng) {
        max_lat = Math.max(max_lat, loc.lat);
        max_lng = Math.max(max_lng, loc.lng);
        min_lat = Math.min(min_lat, loc.lat);
        min_lng = Math.min(min_lng, loc.lng);
      }
    });

    if (min_lat !== 1000 && min_lng !== 1000) {
      center_lat.value = (max_lat + min_lat) / 2;
      center_lng.value = (max_lng + min_lng) / 2;

      const lng_dis = Math.abs(max_lng - min_lng) * 91;
      const lat_dis = Math.abs(max_lat - min_lat) * 111;
      const max_dis = Math.max(lng_dis, lat_dis);

      if (max_dis > 300) zoom.value = 7;
      else if (max_dis > 100) zoom.value = 8;
      else if (max_dis > 50) zoom.value = 9;
      else if (max_dis > 20) zoom.value = 10;
      else if (max_dis > 10) zoom.value = 11;
      else if (max_dis > 5) zoom.value = 12;
      else zoom.value = 13;
    }

    const closeAllInfoWindows = () => {
      for (const iw of info_windows) {
        iw.close();
      }
    };

    const initMap = () => {
      if (!mapRef.value) return;
      if (mapObj.value) return;

      const map = new google.maps.Map(mapRef.value, {
        center: { lat: center_lat.value, lng: center_lng.value },
        zoom: zoom.value,
        mapId: GMAPId,
      });
      mapObj.value = map;
      props.restaurants.forEach((restaurant) => {
        const position = restaurant.location;
        if (!position?.lat || !position?.lng) return;

        const content = document.createElement("div");
        content.innerHTML = `
          <div class="text-center">
            <a href="/r/${restaurant.id}">
              ${restaurant.restaurantName}<br />
              <img src="${resizedProfileImage(
                restaurant,
                "600",
              )}" class="h-12 w-12 rounded-full object-cover" />
            </a>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({ content });
        info_windows.push(infoWindow);

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
        });
        marker.addListener("click", () => {
          closeAllInfoWindows();
          infoWindow.open(map.value, marker);
        });
      });
    };

    onMounted(() => {
      const wait = setInterval(() => {
        if (
          typeof google !== "undefined" &&
          google.maps?.marker?.AdvancedMarkerElement
        ) {
          clearInterval(wait);
          initMap();
        }
      }, 100);
    });

    return {
      mapRef,
      center_lat,
      center_lng,
      zoom,
      closeAllInfoWindows,
      GAPIKey,
      GMAPId,
      resizedProfileImage,
    };
  },
});
</script>
