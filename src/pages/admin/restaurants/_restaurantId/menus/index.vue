<template>
  <section class="section">
    <h2 class="p-big bold">
      Menu
    </h2>
    <div class="card block">
      <div class="card-content">
        <div v-if="!existsMenu" class="container content has-text-centered">
          <b-icon icon="book-open" size="is-large"></b-icon>
          <h3>No items</h3>
          Please create your menu from the bottom button.
        </div>
      </div>
    </div>

    <div v-if="existsMenu">
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
    TitleEditCard,
    menuItems: []
  },
  data() {
    return {
      menuItems: []
    };
  },
  beforeCreated() {
    this.checkAdminPermission();
  },
  computed: {
    existsMenu() {
      if (this.menuItems.length > 0) {
        return true;
      }
      return false;
    }
  },
  async mounted() {
    const uid = this.$store.getters["admin/user"].uid;
    // const resId = this.$route.params.restaurantId;
    const res = await db
      .collection("restaurants")
      .doc(this.$route.params.restaurantId)
      .collection("menus")
      .get();

    try {
      this.menuItems = (res.docs || []).map(doc => {
        let menuId = doc.id;
        const data = doc.data();
        data.menuId = doc.id;
        data.id = doc.id;
        return data;
      });
    } catch (error) {
      console.log("Error fetch menu,", error);
    }
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
