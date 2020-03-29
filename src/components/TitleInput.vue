<template>
  <div class="card block">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <b-field>
            <b-input
              v-model="title"
              placeholder="Enter title"
              @keydown.native="onKeydown"
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
  data() {
    return {
      title: ""
    };
  },
  beforeCreated() {
    this.checkAdminPermission();
  },
  computed: {
    formIsValid() {
      return this.title !== "";
    }
  },
  methods: {
    onKeydown(event) {
      if (event.which === 13) {
        this.submitItem();
      }
    },
    async submitItem() {
      if (!this.formIsValid) return;

      const menuId = this.generateUniqueId();
      const itemData = {
        title: this.title,
        titleFlag: true,
        createdAt: new Date()
      };
      await this.createItemData(this.restaurantId(), itemData);

      this.$emit("finishTitleInput");
    },
    generateUniqueId() {
      return (
        new Date().getTime().toString(16) +
        Math.floor(1000000000 * Math.random()).toString(16)
      );
    },
    createItemData(restaurantId, itemData) {
      return new Promise((resolve, rejected) => {
        db.collection("restaurants")
          .doc(restaurantId)
          .collection("menus")
          .add(itemData)
          .then(() => {
            resolve();
          })
          .catch(error => {
            console.error("Error writing document: ", error);
            this.loading = false;
          });
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
