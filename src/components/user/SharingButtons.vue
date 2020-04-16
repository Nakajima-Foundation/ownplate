<template>
  <social-sharing :url="targetURL" :title="title" hashtags="ownplate" inline-template>
    <div>
      <network network="facebook">
        <i class="fab fa-facebook"></i> Facebook
      </network>
      <network network="twitter">
        <i class="fab fa-twitter"></i> Twitter
      </network>
    </div>
  </social-sharing>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: false
    }
  },
  computed: {
    targetURL() {
      return this.url || window.location.hash;
    }
  }
};
</script>
