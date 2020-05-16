<template>
  <social-sharing :url="targetURL" :title="title" hashtags="ownplate" inline-template>
    <div>
      <network network="facebook" class="facebook">
        <span style="color:#3b5998; cursor: pointer; padding: 8px;">
          <i class="fab fa-facebook"></i>
          Facebook
        </span>
      </network>
      <br />
      <br />
      <network network="twitter" class="twitter">
        <span style="color:#00acee; cursor: pointer; padding: 8px;">
          <i class="fab fa-twitter"></i>
          Twitter
        </span>
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
      return this.url || window.location.href;
    }
  }
};
</script>
