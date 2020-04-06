<template>
  <section class="section">
    <b-button
      style="margin-right:auto"
      type="is-primary"
      class="counter-button"
      icon-left="arrow-left"
      rounded
      outlined
      @click="goRestaurant()"
    >
      {{$t("button.back")}}
    </b-button>

    <section class="section" v-if="readyToDisplay">
      <div class="media">
        <div class="media-left">
          <figure class="image is-64x64">
            <img
              class="is-rounded"
              :src="restaurantInfo.restProfilePhoto"
              alt=""
            />
          </figure>
        </div>
        <div class="media-content">
          <h3 class="title is-4">
            {{ restaurantInfo.restaurantName }}
          </h3>
        </div>
      </div>

      <h2 class="p-big bold">
        Menu
      </h2>
      <div v-if="!existsMenu" class="card block">
        <div class="card-content">
          <div class="container content has-text-centered">
            <b-icon icon="book-open" size="is-large"></b-icon>
            <h3>No items</h3>
            Please create your menu from the bottom button.
          </div>
        </div>
      </div>

      <div v-if="existsMenu">
        <div v-for="(menuList, index) in menuLists" :key="menuList">
          <div v-if="itemsObj[menuList] && itemsObj[menuList]._dataType === 'title'">
            <div v-if="itemsObj[menuList]._isEditing === true">
              <title-input
                @updateTitle="updateTitle($event)"
                :title="itemsObj[menuList]"
                ></title-input>
            </div>
            <div v-else>
              <title-card
                :title="itemsObj[menuList]"
                :position="index == 0 ? 'first' : ((menuLists.length - 1) === index ? 'last' : '')"
                @toEditMode="toEditMode($event)"
                @positionUp="positionUp($event)"
                @positionDown="positionDown($event)"
                @forkItem="forkItem($event)"
                @deleteItem="deleteItem($event)"
                ></title-card>
            </div>
          </div>
          <div v-else-if="itemsObj[menuList] && itemsObj[menuList]._dataType === 'menu'" >
            <item-edit-card
              :menuitem="itemsObj[menuList]"
              :position="index == 0 ? 'first' : ((menuLists.length - 1) === index ? 'last' : '')"
              @emitting="emitted($event)"

              @toEditMode="toEditMode($event)"
              @positionUp="positionUp($event)"
              @positionDown="positionDown($event)"
              @forkItem="forkItem($event)"
              @deleteItem="deleteItem($event)"
            ></item-edit-card>
          </div>
        </div>
      </div>

      <div style="margin-top:1rem;">
        <div class="columns">
          <div class="column">
            <b-button
              style="margin-right:auto"
              type="is-primary"
              class="counter-button"
              expanded
              rounded
              outlined
              @click="addTitle()"
            >
              {{$t("button.addTitle")}}
            </b-button>
          </div>
          <div class="column">
            <b-button
              style="margin-right:auto"
              type="is-primary"
              class="counter-button"
              expanded
              rounded
              outlined
              @click="addMenuItem()"
            >
              {{$t("button.addItem")}}
            </b-button>
          </div>
        </div>
      </div>
      <div style="margin-top:1rem;">
        <b-button
          style="margin-right:auto"
          type="is-primary"
          class="counter-button"
          expanded
          rounded
          @click="goRestaurant"
        >
          Save
        </b-button>
      </div>
    </section>
  </section>
</template>
<script>
import { db } from "~/plugins/firebase.js";
import ItemEditCard from "~/components/ItemEditCard";
import TitleCard from "~/components/TitleCard";
import TitleInput from "~/components/TitleInput";

import * as firebase from "firebase/app";

export default {
  name: "Menus",
  components: {
    ItemEditCard,
    TitleCard,
    TitleInput
  },
  data() {
    return {
      readyToDisplay: false,
      menuLists: [],
      itemsObj: {},
      restaurantInfo: {},
    };
  },
  created() {
    this.checkAdminPermission();
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
    existsMenu() {
      return (this.menuLists.length > 0);
    }
  },
  async mounted() {
    const restaurantRef =  db.doc(`restaurants/${this.restaurantId()}`);
    const resRestInfo = await restaurantRef.get();

    if (resRestInfo.exists) {
      this.restaurantInfo = resRestInfo.data();
    } else {
      console.log("Error fetch restaurantInfo.");
    }
    // todo use computed and/or watch
    const menu_res = await restaurantRef.collection('menus').where("deletedFlag", "==", false).get();
    const title_res = await restaurantRef.collection('titles').where("deletedFlag", "==", false).get();

    this.menuLists = this.restaurantInfo.menuLists || [];

    try {
      const menus = (menu_res.docs || []).map(this.doc2data("menu"));
      const titles = (title_res.docs || []).map(this.doc2data("title"))
      this.itemsObj =  this.array2obj(menus.concat(titles));

      // for backward compatibility
      if (Object.keys(this.itemsObj).length !== this.menuLists.length) {
        const diff = Object.keys(this.itemsObj).filter(itemKey => this.menuLists.indexOf(itemKey) === -1);
        this.menuLists = this.menuLists.concat(diff);
      }
    } catch (error) {
      console.log("Error fetch menu,", error);
    } finally {
      this.readyToDisplay = true;
    }

  },
  methods: {
    addMenuItem() {
      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}/menus/new`
      });
    },
    async updateTitle(title) {
      console.log(`restaurants/${this.restaurantId()}/titles/${title.id}`);
      await db.doc(`restaurants/${this.restaurantId()}/titles/${title.id}`).update("name", title.name);
      this.changeTitleMode(title.id, false);
    },
    async addTitle() {
      const data = {
        name: "",
        uid: this.$store.getters.uidAdmin,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        deletedFlag: false,
      };
      const newTitle = await db.collection(`restaurants/${this.restaurantId()}/titles`).add(data);
      data.id = newTitle.id;
      data._dataType = "title";
      data._isEditing = true;
      this.menuLists.unshift(newTitle.id);
      this.itemsObj[newTitle.id] = data;

      this.saveMenuList();
    },
    saveMenuList() {
      db.doc(`restaurants/${this.restaurantId()}`).update("menuLists", this.menuLists);
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
    },
    // edit title
    toEditMode(titleId) {
      this.changeTitleMode(titleId, true);
    },
    changeTitleName(titleId, value) {
      this.changeTitleObj(titleId, 'name', value);
    },
    changeTitleMode(titleId, value) {
      this.changeTitleObj(titleId, '_isEditing', value);
    },
    changeTitleObj(titleId, key, value) {
      const itemsObj = {...this.itemsObj};
      const data = itemsObj[titleId];
      data[key] = value;
      itemsObj[titleId] = data;
      this.itemsObj = itemsObj;
    },
    // end of edit title

    //
    positionUp(itemKey) {
      const pos = this.menuLists.indexOf(itemKey);
      if (pos !== 0 && pos !== -1) {
        const newMenuLists = [...this.menuLists];
        const tmp = newMenuLists[pos - 1];
        newMenuLists[pos - 1] = newMenuLists[pos]
        newMenuLists[pos] = tmp;
        this.menuLists = newMenuLists;
        this.saveMenuList();
      }
    },
    positionDown(itemKey) {
      const pos = this.menuLists.indexOf(itemKey);
      if (pos !== this.menuLists.length && pos !== -1) {
        const newMenuLists = [...this.menuLists];
        const tmp = newMenuLists[pos + 1];
        newMenuLists[pos + 1] = newMenuLists[pos]
        newMenuLists[pos] = tmp;
        this.menuLists = newMenuLists;
        this.saveMenuList();
      }
    },
    async forkItem(itemKey) {
      const pos = this.menuLists.indexOf(itemKey);
      const item = this.itemsObj[itemKey];
      if (item._dataType === "menu") {
        const data = {
          itemName: item.itemName,
          price: Number(item.price),
          tax: item.tax,
          itemDescription: item.itemDescription,
          itemPhoto: item.itemPhoto,
          availability: item.availability,
          uid: this.uid,
          deletedFlag: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        const newData = await db.collection(`restaurants/${this.restaurantId()}/menus`).add(data);
        data.id = newData.id;
        data._dataType = "menu";

        this.itemsObj[newData.id] = data;
        this.menuLists.splice(pos, 0, newData.id);
        this.saveMenuList();

      }
      if (item._dataType === "title") {
        const data = {
          name: item.name,
          uid: this.uid,
          deletedFlag: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        const newTitle = await db.collection(`restaurants/${this.restaurantId()}/titles`).add(data);
        data.id = newTitle.id;
        data._dataType = "title";
        data._isEditing = false;

        this.itemsObj[newTitle.id] = data;
        this.menuLists.splice(pos, 0, newTitle.id);
        this.saveMenuList();
      }
    },
    async deleteItem(itemKey) {
      // delete from list
      const pos = this.menuLists.indexOf(itemKey);
      const item = this.itemsObj[itemKey];
      this.menuLists.splice( pos, 1 );
      if (item._dataType === "menu") {
        await db.doc(`restaurants/${this.restaurantId()}/menus/${itemKey}`).update("deletedFlag", true);
      }
      if (item._dataType === "title") {
        await db.doc(`restaurants/${this.restaurantId()}/titles/${itemKey}`).update("deletedFlag", true);
      }
      this.saveMenuList();
    },
  }
};
</script>
<style lang="scss" scoped>
.media-content {
  margin-top: auto;
  margin-bottom: auto;
}
</style>
