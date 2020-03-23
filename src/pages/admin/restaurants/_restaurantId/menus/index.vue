<template>
  <section class="section">
    <h2 class="p-big bold">
      Menu
    </h2>

    <div v-for="menuItem in menuItems" :key="menuItem.id">
      <div v-if="menuItem.titleFlag">
        <title-edit-card :title="menuItem.title"></title-edit-card>
      </div>
      <div v-else>
        <item-edit-card
          :title="menuItem.itemName"
          :payment="menuItem.price"
          :discription="menuItem.itemDescription"
          :image="menuItem.itemPhoto"
          @emitting="emitted($event)"
        ></item-edit-card>
      </div>
    </div>

    <div style="margin-top:1rem;">
      <div class="columns">
        <div class="column">
          <b-button
            style="margin-right:auto"
            type="is-info"
            class="counter-button"
            expanded
            rounded
            outlined
            @click="editTitle()"
          >
            Add title
          </b-button>
        </div>
        <div class="column">
          <b-button
            style="margin-right:auto"
            type="is-info"
            class="counter-button"
            expanded
            rounded
            outlined
            @click="editMenuItem()"
          >
            Add Item
          </b-button>
        </div>
      </div>
    </div>
    <div style="margin-top:1rem;">
      <b-button
        style="margin-right:auto"
        type="is-info"
        class="counter-button"
        expanded
        rounded
        @click="goRestaurant"
      >
        Save
      </b-button>
    </div>
  </section>
</template>
<script>
import { db } from "~/plugins/firebase.js";
import ItemEditCard from "~/components/ItemEditCard";
import TitleEditCard from "~/components/TitleEditCard";

export default {
  name: "Menus",
  components: {
    ItemEditCard,
    TitleEditCard
  },
  data() {
    return {
      menuItems: []
    };
  },
  mounted() {
    //fetch menus
    db.collection("restaurants")
      .doc(this.$route.params.restaurantId)
      .collection("menus")
      .orderBy("createdAt", "desc")
      .get()
      .then(data => {
        data.forEach(doc => {
          let id = doc.id;
          let {
            itemName,
            price,
            tax,
            itemDescription,
            itemPhoto,
            createdAt,
            titleFlag,
            title
          } = doc.data();
          this.menuItems.push({
            itemName,
            price,
            tax,
            itemDescription,
            itemPhoto,
            createdAt,
            titleFlag,
            title
          });
        });
      })
      .catch(error => {
        console.log("Error fetch doc,", error);
      });
  },
  methods: {
    restaurantId() {
      return this.$route.params.restaurantId;
    },
    editMenuItem() {
      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}/menus/new`
      });
    },
    editTitle() {
      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}/menus/newtitle/`
      });
    },
    goRestaurant() {
      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}`
      });
    }
  }
};
</script>
<style lang="stylus" scoped></style>
