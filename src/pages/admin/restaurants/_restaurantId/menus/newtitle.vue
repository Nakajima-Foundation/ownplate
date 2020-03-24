<template>
  <section class="section">
    <h2 class="p-big bold">
      About
    </h2>
    <div class="media">
      <div class="media-content"></div>
      <div class="media-right">
        <p class="p-small bold" style="color:#CB4B4B">
          * Required
        </p>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Title
        </h4>
        <p class="p-small" style="color:#CB4B4B">
          *
        </p>
      </div>
    </div>
    <b-field>
      <b-input v-model="title" placeholder="Enter title"></b-input>
    </b-field>

    <b-button
      :disabled="!formIsValid"
      style="margin-right:auto"
      type="is-info"
      class="counter-button"
      expanded
      rounded
      @click="submitItem"
    >
      Save
    </b-button>
  </section>
</template>

<script>
import Vue from "vue";
import { db, storage } from "~/plugins/firebase.js";

export default {
  name: "NewTitle",
  data() {
    return {
      title: "",
      uid: "hogehoge" //TODO test
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
    restaurantId() {
      return this.$route.params.restaurantId;
    },
    async submitItem() {
      if (!this.formIsValid) return;

      //upload image
      const menuId = this.generateUniqueId();
      const itemData = {
        title: this.title,
        titleFlag: true,
        createdAt: new Date()
      };
      await this.createItemData(this.restaurantId(), itemData);

      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}/menus`
      });
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
