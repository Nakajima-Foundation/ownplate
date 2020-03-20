<template>
  <!-- shop-orner -->
  <div class="media">
    <div class="media-left">
      <figure class="image is-64x64">
        <img class="is-rounded" :src="src" alt="" />
      </figure>
    </div>
    <div class="media-content">
      <h3 class="title is-4">
        {{ name }}
      </h3>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.media-content {
  margin-top: auto;
  margin-bottom: auto;
}
</style>
