<template>
  <div class="GMap__InfoWindow">
    <slot/>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      default: () => {
        return {}
      }
    }
  },

  data(){
    return{
      infoWindow: null
    }
  },

	methods: {
    initInfoWindow(){
      this.infoWindow = new google.maps.InfoWindow({
        content: this.$el,
        ...this.options
      });
      this.$parent.marker.infoWindow = this.infoWindow;
    }
  },
}
</script>