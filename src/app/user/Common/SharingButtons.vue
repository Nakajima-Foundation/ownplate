<template>
  <social-sharing
    :url="targetURL"
    :title="title"
    :hashtags="hashtag"
    inline-template
  >
    <div>
      <div>
        <network network="facebook" class="facebook">
          <a
            class="inline-flex justify-center items-center"
            style="color:#3b5998;"
          >
            <i class="fab fa-facebook mr-2"></i>
            <div class="text-sm font-bold">Facebook</div>
          </a>
        </network>
      </div>

      <div class="mt-2">
        <network network="twitter" class="twitter">
          <a
            class="inline-flex justify-center items-center"
            style="color:#00acee;"
          >
            <i class="fab fa-twitter mr-2"></i>
            <div class="text-sm font-bold">Twitter</div>
          </a>
        </network>
      </div>
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
    },
    hashtag() {
      return this.regionalSetting.hashTag;
    }
  }
};
</script>
