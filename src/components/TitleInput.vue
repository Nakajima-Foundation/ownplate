<template>
  <div class="card block">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <b-field>
            <b-input
              ref="textInput"
              v-model="title.name"
              @blur="blur"
              placeholder="Enter title"
            ></b-input>
          </b-field>
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
import Vue from "vue";
import { db, storage } from "~/plugins/firebase.js";

export default {
  name: "TitleInput",
  props: {
    title: {
      type: Object,
      required: true
    }
  },
  beforeCreated() {
    this.checkAdminPermission();
  },
  mounted() {
    this.$refs.textInput.focus();
  },
  methods: {
    blur() {
      // save and update this.
      this.$emit("updateTitle", this.title);
    },
  }
};
</script>
<style lang="scss" scoped>
.card {
  margin-bottom: 0.6rem;
}
.tax {
  margin-top: -2rem !important;
}
</style>
