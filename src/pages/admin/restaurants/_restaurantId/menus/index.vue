<template>
  <section class="section">
    <b-button
      style="margin-right:auto"
      type="is-info"
      class="counter-button"
      icon-left="arrow-left"
      rounded
      outlined
      @click="goRestaurant()"
    >
      Back
    </b-button>

    <h2 class="p-big bold">
      Menu
    </h2>
    <div v-if="!existsMenu && !titleEditFlag" class="card block">
      <div class="card-content">
        <div class="container content has-text-centered">
          <b-icon icon="book-open" size="is-large"></b-icon>
          <h3>No items</h3>
          Please create your menu from the bottom button.
        </div>
      </div>
    </div>

    <title-input
      v-if="titleEditFlag"
      @finishTitleInput="finishTitleInput"
    ></title-input>

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
            @click="addTitle()"
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
            @click="addMenuItem()"
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
import TitleInput from "~/components/TitleInput";

export default {
  name: "Menus",
  components: {
    ItemEditCard,
    TitleEditCard,
    TitleInput
  },
  data() {
    return {
      menuItems: [],
      titleEditFlag: false
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
    const uid = this.adminUid();
    // const resId = this.$route.params.restaurantId;
    const res = await db
      .collection(`restaurants/${this.restaurantId()}/menus`)
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
    addMenuItem() {
      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}/menus/new`
      });
    },
    addTitle() {
      // this.$router.push({
      //   path: `/admin/restaurants/${this.restaurantId()}/menus/newtitle/`
      // });
      this.titleEditFlag = true;
    },
    goRestaurant() {
      this.$router.push({
        path: `/admin/restaurants/`
      });
    },
    finishTitleInput() {
      this.$router.go({
        path: `/admin/restaurants/${this.restaurantId()}/menus`,
        force: true
      });
    }
  }
};
</script>
<style lang="stylus" scoped></style>
