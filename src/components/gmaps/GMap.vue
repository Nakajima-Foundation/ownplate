<template>
  <div class="GMap">
    <div ref="map" class="GMap__Wrapper"></div>
    <slot />
  </div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";

export default {
  props: {
    options: {
      type: Object,
      default: () => {
        return {};
      },
    },
    language: {},
    zoom: {
      type: Number,
      default: 10,
    },
    center: {
      type: Object,
      default: () => {
        return {
          lat: 45.815,
          lng: 15.9819,
        };
      },
    },
  },

  data() {
    return {
      map: null,
      google: null,
      markers: [],
      events: [
        "bounds_changed",
        "center_changed",
        "click",
        "dblclick",
        "drag",
        "dragend",
        "dragstart",
        "heading_changed",
        "idle",
        "maptypeid_changed",
        "mousemove",
        "mouseout",
        "mouseover",
        "projection_changed",
        "resize",
        "rightclick",
        "tilesloaded",
        "tilt_changed",
        "zoom_changed",
      ],
    };
  },

  async mounted() {
    if (this.$GMaps.loaded === false) {
      this.$GMaps.loaded = true;
      try {
        let GMapSettings = {
          apiKey: this.$GMaps.apiKey,
          language: this.language,
        };

        if (this.$GMaps.libraries !== undefined) {
          GMapSettings["libraries"] = this.$GMaps.libraries;
        }

        const loader = new Loader(GMapSettings);
        const google = await loader.load();
        this.$GMaps.google = google;
      } catch (e) {}
    }

    this.google = await this.$GMaps.google;
    this.initMap();
    this.$emit("init", this.google);
    this.$emit("loaded", this.google);
  },

  beforeDestroy() {
    this.$GMaps.loaded = false;
  },

  methods: {
    initMap() {
      this.map = new google.maps.Map(this.$refs.map, {
        center: this.center,
        zoom: this.zoom,
        ...this.options,
      });

      this.initChildren();
      this.events.forEach((event) => {
        this.map.addListener(event, (e) => {
          this.$emit(event, { map: this.map, event: e });
        });
      });
    },

    initChildren() {
      if (this.markers.length > 0) this.markers = [];

      this.$children.forEach((child) => {
        child.init();
      });

      this.map["markers"] = this.markers;

    },

  },
};
</script>

<style>
.GMap__Wrapper {
  width: 100%;
  height: 400px;
}
</style>
