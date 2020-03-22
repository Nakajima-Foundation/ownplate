<template>
  <section class="section">
    <h2 class="p-big bold">
      Menu
    </h2>
    <h2 class="p-big bold">
      Most popular
    </h2>

    <div v-for="menuItem in menuItems" :key="menuItem.id">
      <item-card
        :title="menuItem.itemName"
        :payment="menuItem.price"
        :discription="menuItem.itemDescription"
        :image="menuItem.itemPhoto"
        @emitting="emitted($event)"
      ></item-card>
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
import ItemCard from "~/components/ItemCard";

export default {
  name: "Menus",
  components: {
    ItemCard
  },
  data() {
    return {
      menuItems: []
    };
  },
  mounted() {
    db.collection("restaurants")
      .doc(this.$route.query.id)
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
            createdAt
          } = doc.data();
          this.menuItems.push({
            itemName,
            price,
            tax,
            itemDescription,
            itemPhoto,
            createdAt
          });
        });
      })
      .catch(error => {
        console.log("Error fetch doc,", error);
      });
  },
  methods: {
    editMenuItem() {
      this.$router.push({
        path: `/admin/restaurants/menus/new/?id=${this.$route.query.id}`
      });
    },
    goRestaurant() {
      this.$router.push({
        path: `/admin/restaurants/?id=${this.$route.query.id}`
      });
    }
  }
};
</script>
<style lang="stylus" scoped></style>
