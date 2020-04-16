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
    <social-sharing :url="currentURL" :title="name" hashtags="ownplate" inline-template>
      <div>
        <network network="facebook">
          <i class="fab fa-facebook"></i> Facebook
        </network>
        <network network="twitter">
          <i class="fab fa-twitter"></i> Twitter
        </network>
      </div>
    </social-sharing>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String
    },
    name: {
      type: String,
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {
    currentURL() {
      return window.location.href;
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
