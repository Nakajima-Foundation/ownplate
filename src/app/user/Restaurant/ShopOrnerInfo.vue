<template>
  <!-- shop-orner -->
  <div class="media">
    <div class="media-left" v-if="src">
      <figure class="image is-64x64">
        <img class="is-rounded" :src="src" alt />
      </figure>
    </div>
    <div class="media-content">
      <span class="shop-name">{{ name }}</span>
    </div>
    <sharing-buttons :title="name" :url="shareUrl()" />
  </div>
</template>

<script>
import SharingButtons from "~/app/user/Common/SharingButtons";

export default {
  components: {
    SharingButtons
  },
  props: {
    src: {
      type: String
    },
    name: {
      type: String,
      required: true
    }
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.media-content {
  margin-top: auto;
  margin-bottom: auto;
}
.shop-name {
  font-weight: bold;
  font-size: 1.75rem;
}
</style>
