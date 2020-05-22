<template>
  <section class="section">
    <back-button url="/admin/restaurants/" />

    <template v-if="notFound===null"></template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <section class="section" v-else-if="readyToDisplay">
      <div class="media">
        <div class="media-left">
          <figure class="image is-64x64">
            <img class="is-rounded" :src="restaurantInfo.restProfilePhoto" alt />
          </figure>
        </div>
        <div class="media-content">
          <h3 class="title is-4">{{ restaurantInfo.restaurantName }}</h3>
        </div>
      </div>

      <h2 class="p-big bold">{{$t('editMenu.menu')}}</h2>
      <div v-if="!existsMenu" class="card block">
        <div class="card-content">
          <div class="container content has-text-centered">
            <b-icon icon="book-open" size="is-large"></b-icon>
            <h3>{{$t('editMenu.noItem')}}</h3>
            {{$t('editMenu.pleaseAddItem')}}
          </div>
        </div>
      </div>

      <div v-if="existsMenu">
        <div v-for="(menuList, index) in menuLists" :key="menuList">
          <div v-if="itemsObj[menuList] && itemsObj[menuList]._dataType === 'title'">
            <div v-if="editings[menuList] === true">
              <title-input @updateTitle="updateTitle($event)" :title="itemsObj[menuList]"></title-input>
            </div>
            <div v-else>
              <title-card
                :title="itemsObj[menuList]"
                :position="index == 0 ? 'first' : ((menuLists.length - 1) === index ? 'last' : '')"
                @toEditMode="toEditMode($event)"
                @positionUp="positionUp($event)"
                @positionDown="positionDown($event)"
                @forkItem="forkTitleItem($event)"
                @deleteItem="deleteItem($event)"
              ></title-card>
            </div>
          </div>
          <div v-else-if="itemsObj[menuList] && itemsObj[menuList]._dataType === 'menu'">
            <item-edit-card
              :menuitem="itemsObj[menuList]"
              :position="index == 0 ? 'first' : ((menuLists.length - 1) === index ? 'last' : '')"
              :shopInfo="restaurantInfo"
              @positionUp="positionUp($event)"
              @positionDown="positionDown($event)"
              @forkItem="forkMenuItem($event)"
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
              :disabled="submitting"
              @click="addTitle()"
            >{{$t("button.addTitle")}}</b-button>
          </div>
          <div class="column">
            <b-button
              style="margin-right:auto"
              type="is-primary"
              class="counter-button"
              expanded
              rounded
              outlined
              :disabled="submitting"
              @click="addMenu()"
            >{{$t("button.addItem")}}</b-button>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>
<script>
import { db } from "~/plugins/firebase.js";
import ItemEditCard from "~/app/admin/Menus/ItemEditCard";
import TitleCard from "~/app/admin/Menus/TitleCard";
import TitleInput from "~/app/admin/Menus/TitleInput";
import NotFound from "~/components/NotFound";
import BackButton from "~/components/BackButton";

import * as firebase from "firebase/app";

export default {
  name: "Menus",
  components: {
    ItemEditCard,
    TitleCard,
    TitleInput,
    BackButton,
    NotFound
  },
  data() {
    return {
      submitting: false,
      readyToDisplay: false,
      restaurantInfo: {},
      menuCollection: null,
      titleCollection: null,
      editings: {},
      detachers: [],
      notFound: null
    };
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
    existsMenu() {
      return this.menuLists.length > 0;
    },
    itemsObj() {
      if (this.menuCollection && this.titleCollection) {
        const menus = (this.menuCollection.docs || []).map(
          this.doc2data("menu")
        );
        const titles = (this.titleCollection.docs || []).map(
          this.doc2data("title")
        );
        return this.array2obj(menus.concat(titles));
      }
      return {};
    },
    menuLists() {
      return this.restaurantInfo.menuLists || [];
    }
  },
  async created() {
    this.checkAdminPermission();
    const restaurantRef = db.doc(`restaurants/${this.restaurantId()}`);
    const restaurant_detacher = restaurantRef.onSnapshot(results => {
      if (results.exists && results.data().uid === this.uid) {
        this.restaurantInfo = results.data();
        this.readyToDisplay = true;
        this.notFound = false;
        // this.updateBrokenMenu();
      } else {
        this.notFound = true;
        // 404
        console.log("Error fetch restaurantInfo.");
      }
    });
    const menu_detacher = restaurantRef
      .collection("menus")
      .where("deletedFlag", "==", false)
      .onSnapshot(results => {
        this.menuCollection = results.empty ? {} : results;
        // for debug
        results.docs.forEach(a => {
          if (a.data().publicFlag === undefined) {
            a.ref.update({ publicFlag: true });
          }
        });
      });
    const title_detacher = restaurantRef
      .collection("titles")
      .where("deletedFlag", "==", false)
      .onSnapshot(results => {
        this.titleCollection = results.empty ? {} : results;
      });
    this.detacher = [restaurant_detacher, menu_detacher, title_detacher];
  },
  destroyed() {
    if (this.detachers) {
      this.detachers.map(detacher => {
        detacher();
      });
    }
  },
  /*
  watch: {
    itemsObj: function() {
      this.updateBrokenMenu();
    }
  },
*/
  methods: {
    /*
    updateBrokenMenu() {
      // if loaded all data
      if (this.notFound === false && Object.keys(this.itemsObj).length > 0) {
        if (this.restaurantInfo.menuLists === undefined) {
          db.doc(`restaurants/${this.restaurantId()}`).update(
            "menuLists",
            Object.keys(this.itemsObj)
          );
        }
      }
    },
    */
    async updateTitle(title) {
      await db
        .doc(`restaurants/${this.restaurantId()}/titles/${title.id}`)
        .update("name", title.name);
      this.changeTitleMode(title.id, false);
    },
    async addTitle() {
      this.submitting = true;
      try {
        const data = {
          name: "",
          uid: this.$store.getters.uidAdmin,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          deletedFlag: false
        };
        const newTitle = await db
          .collection(`restaurants/${this.restaurantId()}/titles`)
          .add(data);
        const newMenuLists = this.menuLists;
        // newMenuLists.unshift(newTitle.id);
        newMenuLists.push(newTitle.id);

        await this.saveMenuList(newMenuLists);
      } catch (e) {
        console.log(e);
      } finally {
        this.submitting = false;
      }
    },
    async addMenu() {
      this.submitting = true;
      try {
        const itemData = {
          itemName: "",
          price: 0,
          tax: "food",
          itemDescription: "",
          uid: this.$store.getters.uidAdmin,
          deletedFlag: false,
          publicFlag: true,
          validatedFlag: false,
          createdAt: new Date()
        };
        const newData = await db
          .collection(`restaurants/${this.restaurantId()}/menus`)
          .add(itemData);

        const newMenuLists = this.menuLists;
        newMenuLists.push(newData.id);
        await this.saveMenuList(newMenuLists);
        this.$router.push({
          path: `/admin/restaurants/${this.restaurantId()}/menus/${newData.id}`
        });
      } catch (e) {
        console.log(e);
      } finally {
        this.submitting = false;
      }
    },

    async saveMenuList(menuLists) {
      await db
        .doc(`restaurants/${this.restaurantId()}`)
        .update("menuLists", menuLists);
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
    changeTitleMode(titleId, value) {
      const newEditings = { ...this.editings };
      newEditings[titleId] = value;
      this.editings = newEditings;
    },
    // end of edit title

    //
    async positionUp(itemKey) {
      const pos = this.menuLists.indexOf(itemKey);
      if (pos !== 0 && pos !== -1) {
        const newMenuLists = [...this.menuLists];
        const tmp = newMenuLists[pos - 1];
        newMenuLists[pos - 1] = newMenuLists[pos];
        newMenuLists[pos] = tmp;
        await this.saveMenuList(newMenuLists);
      }
    },
    async positionDown(itemKey) {
      const pos = this.menuLists.indexOf(itemKey);
      if (pos !== this.menuLists.length && pos !== -1) {
        const newMenuLists = [...this.menuLists];
        const tmp = newMenuLists[pos + 1];
        newMenuLists[pos + 1] = newMenuLists[pos];
        newMenuLists[pos] = tmp;
        await this.saveMenuList(newMenuLists);
      }
    },
    async forkTitleItem(itemKey) {
      const item = this.itemsObj[itemKey];
      const data = {
        name: item.name,
        uid: this.uid,
        deletedFlag: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const newTitle = await db
        .collection(`restaurants/${this.restaurantId()}/titles`)
        .add(data);
      this.forkItem(itemKey, newTitle);
    },
    async forkMenuItem(itemKey) {
      const item = this.itemsObj[itemKey];
      const data = {
        itemName: item.itemName,
        price: Number(item.price),
        tax: item.tax,
        itemDescription: item.itemDescription,
        itemPhoto: item.itemPhoto,
        images: item.images,
        availability: item.availability,
        uid: this.uid,
        deletedFlag: false,
        publicFlag: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const newData = await db
        .collection(`restaurants/${this.restaurantId()}/menus`)
        .add(this.cleanObject(data));
      this.forkItem(itemKey, newData);
    },
    async forkItem(itemKey, newData) {
      const pos = this.menuLists.indexOf(itemKey);
      const item = this.itemsObj[itemKey];

      const newMenuLists = this.menuLists;
      newMenuLists.splice(pos, 0, newData.id);
      await this.saveMenuList(newMenuLists);
    },
    async deleteItem(itemKey) {
      // delete from list
      const newMenuLists = this.menuLists;
      const pos = newMenuLists.indexOf(itemKey);
      const item = this.itemsObj[itemKey];
      this.menuLists.splice(pos, 1);
      if (item._dataType === "menu") {
        await db
          .doc(`restaurants/${this.restaurantId()}/menus/${itemKey}`)
          .update("deletedFlag", true);
      }
      if (item._dataType === "title") {
        await db
          .doc(`restaurants/${this.restaurantId()}/titles/${itemKey}`)
          .update("deletedFlag", true);
      }
      await this.saveMenuList(newMenuLists);
    }
  }
};
</script>
<style lang="scss" scoped>
.media-content {
  margin-top: auto;
  margin-bottom: auto;
}
</style>
