<template>
<span>
  <h2>
    {{$t('shopInfo.address')}}
  </h2>
  <div class="card">
    <div class="card-image" v-if="hasLocation">
      <GMap
        ref="gMap"
        :cluster="{options: {styles: 'clusterStyle'}}"
        :options="{fullscreenControl: false, styles: 'mapStyle'}"
        :zoom="18"
        @loaded="updateMap"
        >
      </GMap>
    </div>
    <div class="card-content">
      <div class="content">
        <a
          target="_blank"
          :href="'https://www.google.com/maps/search/?api=1&query=' + this.shopInfo.location.lat + ',' +  this.shopInfo.location.lng + '&query_place_id=' + this.shopInfo.place_id"
          class="p-font-middle"
          >
          <i class="fas fa-map-marker-alt" style="margin-right:1rem;"></i>
          {{this.shopInfo.streetAddress}}, {{this.shopInfo.city}}, {{this.shopInfo.state}} {{this.shopInfo.zip}}
        </a>
      </div>
    </div>
  </div>

  <h2 style="margin-top:2rem;">
    {{$t("shopInfo.phonenumber")}}
  </h2>
  <div class="notification is-centered">
    <a>
      <p class="p-font bold" style="text-align:center;">
        {{this.shopInfo.phoneNumber}}
      </p>
    </a>
  </div>
  <div v-if="!compact">
    <h2>
      {{$t("shopInfo.website")}}
    </h2>
    <div class="notification">
      <div class="is-centered" style="text-align: center;">
        <a target="_blank" :href="this.shopInfo.url">
          {{this.shopInfo.url}}
        </a>
      </div>
    </div>

    <h2>
      {{$t("shopInfo.hours")}}
    </h2>
    <div class="notification">
      <div class="is-centered" style="text-align: center;">
        <table :style="{width: '100%'}">
          <template v-for="(day, key) in days">
            <tr :style="(weekday==key) ? {'background-color': 'skyblue'} : {}">
              <td>
                {{$t('week.short.' + day)}}
              </td>
              <td>
                <template v-if=shopInfo.businessDay[key]>
                  <template v-for="(data) in shopInfo.openTimes[key]">
                    {{num2time(data.start)}} - {{num2time(data.end)}}<br/>
                  </template>
                </template>
                <template v-else>
                  Closed
                </template>
              </td>
              <td>
                <template v-if="isOpen[key]">
                  open
                </template>
              </td>
            </tr>
          </template>
        </table>
      </div>
    </div>
  </div>
</span>
</template>

<script>
import { daysOfWeek } from "~/plugins/constant.js";

export default {
  props: {
    shopInfo: {
      type: Object,
      required: true
    },
    compact: {
      type: Boolean,
      required: false
    }
  },
  data() {
    const d = new Date();
    return {
      days: daysOfWeek,
      weekday: d.getDay(),
      today: d,
    };
  },
  computed: {
    isOpen() {
      return Object.keys(this.days).reduce((tmp, day) => {
        if (this.weekday === Number(day) && this.shopInfo.businessDay[day]) {
          // get now and compaire
          const res = this.shopInfo.openTimes[day].reduce((tmp, time) => {
            const now = this.today.getHours() * 60 + this.today.getMinutes();
            const ret = now >= time.start && now <= time.end;
            tmp = tmp || ret;
            return tmp;
          }, false);
          tmp[day] = res;
        } else {
          tmp[day] = false;
        }
        return tmp;
      }, {});
    },
    hasLocation() {
      return this.shopInfo.location && this.shopInfo.location.lat && this.shopInfo.location.lng;
    }
  },
  mounted() {
    this.updateMap();
  },
  methods: {
    updateMap() {
      if (this.hasLocation) {
        if (this.$refs.gMap && this.$refs.gMap.map) {
          const location = this.shopInfo.location;
          console.log(location);
          if (location) {
            this.$refs.gMap.map.setCenter(location);
            const marker = new google.maps.Marker({
              position: new google.maps.LatLng(location.lat, location.lng),
              title: this.shopInfo.restaurantName,
              map: this.$refs.gMap.map,
            });
          }
        }
      }
    },
  },
};

</script>
<style type="scss" scped>
.GMap__Wrapper {
  width: 100%;
  height: 150px;
}
</style>
