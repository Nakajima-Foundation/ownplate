<template>
  <div class="card block">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <h2 class="p-big bold">
            {{ title }}
          </h2>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <a href="#" class="card-footer-item">
        <b-icon icon="arrow-up" size="is-midium"></b-icon>
      </a>
      <a href="#" class="card-footer-item">
        <b-icon icon="arrow-down" size="is-midium"></b-icon>
      </a>
      <a href="#" class="card-footer-item">
        <b-icon icon="plus" size="is-midium"></b-icon>
      </a>
      <a href="#" class="card-footer-item">
        <b-icon icon="delete" size="is-midium"></b-icon>
      </a>
    </div>
  </div>
</template>

<script>
import store from "~/store/index.js";

export default {
  props: {
    title: {
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
.card {
  margin-bottom: 0.6rem;
}
</style>
