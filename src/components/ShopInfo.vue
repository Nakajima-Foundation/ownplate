<template>
  <span>
    <h2 class="bold">
      Adress
    </h2>
    <div class="card">
      <div class="card-image">
        <GMap
          ref="gMap"
          :cluster="{options: {styles: clusterStyle}}"
          :center="{}"
          :options="{fullscreenControl: false, styles: mapStyle}"
          :zoom="18"
          >
        </GMap>
      </div>
      <div class="card-content">
        <div class="content">
          <a
            target="_blank"
            href="https://goo.gl/maps/g1ocnE21MTvbeTaV7"
            class="p-font-middle"
          >
            <i class="fas fa-map-marker-alt" style="margin-right:1rem;"></i>
            {{this.shopInfo.streetAddress}}, {{this.shopInfo.city}}, {{this.shopInfo.state}} {{this.shopInfo.zip}}
          </a>
        </div>
      </div>
    </div>

    <h2 class="bold" style="margin-top:2rem;">
      {{$t("shopInfo.phonenumber")}}
    </h2>
    <div class="notification is-centered">
      <a>
        <p class="p-font bold" style="text-align:center;">
          {{this.shopInfo.phoneNumber}}
        </p>
      </a>
    </div>
    <h2 class="bold">
      {{$t("shopInfo.website")}}
    </h2>
    <div class="notification">
      <div class="is-centered" style="text-align: center;">
        <a target="_blank" :href="this.shopInfo.url">
          {{this.shopInfo.url}}
        </a>
      </div>
    </div>
  </span>
</template>

<script>
export default {
  props: {
    shopInfo: {
      type: Object,
      required: true
    },
  },
  watch: {
    "shopInfo.location" () {
      const location = this.shopInfo.location;
      this.$refs.gMap.map.setCenter(location);
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.lat, location.lng),
        title: this.shopInfo.restaurantName,
        map: this.$refs.gMap.map,
      });
    }
  },
};

</script>
<style type="scss" scped>
.GMap__Wrapper {
  width: 100%;
  height: 150px;
}
</style>
