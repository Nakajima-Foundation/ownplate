<template>
  <social-sharing :url="targetURL" :title="title" hashtags="ownplate" inline-template>
    <div>
      <network network="facebook" class="facebook">
        <span style="color:#3b5998">
          <i class="fab fa-facebook"></i>
          <span class="sharetext">Facebook</span>
        </span>
      </network><br/>
      <network network="twitter" class="twitter">
        <span style="color:#00acee">
          <i class="fab fa-twitter"></i>
          <span class="sharetext">Twitter</span>
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
