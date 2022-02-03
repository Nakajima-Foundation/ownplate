<template>
<div class="h-2/5">
<GMap
    ref="gMap"
    :center="{ lat: 35.6809591, lng: 139.7673068 }"
    :options="{ fullscreenControl: false }"
    :zoom="15"
    @loaded="mapLoaded"
     @click="gmapClick"
    style="height: 500px"
    ></GMap>
<span if="estimatedDistance !== null">
  推定距離: {{estimatedDistance}}m: 配達可能距離 {{radius}}m
</span>
<button @click="conv">conv</button>
</div>
</template>

<script>
export default {
  props: {
    shopInfo: {
      type: Object,
      required: true
    },
    fullAddress: {
      type: String,
      required: false,
    },
  },
  computed: {
    location() {
      return this.shopInfo.location;
    }
  },
  data() {
    return {
      center: null,
      home: null,
      markers: [],
      circles: [],
      radius: 500,
      estimatedDistance: null,
      maplocation: null,
    };
  },
  async created() {
    this.mapLoaded();
  },
  mounted() {
    this.mapLoaded();
  },
  methods: {
    mapLoaded() {
      if (this.shopInfo && this.shopInfo.location) {
        this.setCurrentLocation(this.shopInfo.location);
      }
    },
    setCurrentLocation(location) {
      if (
        this.$refs.gMap &&
        this.$refs.gMap.map &&
        location &&
        location.lat &&
        location.lng
      ) {
        this.center = new google.maps.LatLng(location.lat, location.lng)
        this.$refs.gMap.map.setCenter(this.location);
        this.updateMarker();

        this.maplocation = location;
        this.updateCircle();
      }
    },
    updateMarker() {
      this.removeAllMarker();
      if (this.center) {
        const marker = new google.maps.Marker({
          position: this.center,
          map: this.$refs.gMap.map,
          icon: {
            url: "http://maps.google.co.jp/mapfiles/ms/icons/restaurant.png"
          },
        });
        this.markers.push(marker);
      }
      if (this.home) {
        const marker = new google.maps.Marker({
          position: this.home,
          map: this.$refs.gMap.map,
          icon: {
            url: "http://maps.google.co.jp/mapfiles/ms/icons/blue-dot.png",
          }
        });
        this.markers.push(marker);
      }
    },
    updateCircle() {
      this.removeAllCircle();
      this.$refs.gMap.map.setCenter(this.maplocation);
      const circle = new google.maps.Circle({
        center: this.center,
        fillColor: "#ff0000",
        fillOpacity: 0.3,
        map: this.$refs.gMap.map,
        radius: Number(this.radius),
        strokeColor: '#ff0000',
        strokeOpacity: 1,
        strokeWeight: 1
      });
      this.circles.push(circle);
    },
    removeAllMarker() {
      if (this.markers && this.markers.length > 0) {
        this.markers.map(marker => {
          marker.setMap(null);
        });
        this.markers = [];
      }
    },
    removeAllCircle() {
      if (this.circles && this.circles.length > 0) {
        this.circles.map(circle => {
          circle.setMap(null);
        });
        this.circles = [];
      }
    },
    gmapClick() {
    },
    conv() {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': this.fullAddress, 'language': 'ja'}).then((response) => {
        const res = response.results[0];
        const lat = res.geometry.location.lat();
        const lng = res.geometry.location.lng();
        this.home = new google.maps.LatLng(lat, lng);
        this.updateMarker();
        
        this.estimatedDistance = this.haversine_distance(lat, lng, this.shopInfo.location.lat, this.shopInfo.location.lng);
        console.log(this.estimatedDistance);
      });
    },
    // https://developers-jp.googleblog.com/2019/12/how-calculate-distances-map-maps-javascript-api.html
    haversine_distance(lat1, lng1, lat2, lng2) {
      const R = 6371.0710;
      const rlat1 = lat1 * (Math.PI/180);
      const rlat2 = lat2 * (Math.PI/180);
      const difflat = rlat2 - rlat1;
      const difflon = (lng2 - lng1) * (Math.PI/180);

      const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)
                                          +Math.cos(rlat1)*Math.cos(rlat2)
                                          *Math.sin(difflon/2)*Math.sin(difflon/2)));
      return Math.round(d * 1000);
    }    
  },
}
</script>
