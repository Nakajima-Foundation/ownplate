<template>
  <div>
    <template v-if="notFound === null"></template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <div v-else-if="readyToDisplay">
      <!-- Edit Header Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-24"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Nav Bar -->
            <div class="level">
              <!-- Back Button and Restaurant Profile -->
              <div class="level-left flex-1">
                <!-- Back Button -->
                <back-button url="/admin/restaurants/" class="m-t-24 m-r-16" />
                <!-- Restaurant Profile -->
                <!-- <div class="is-inline-flex flex-center m-t-24">
                  <div>
                    <img :src="restaurantInfo.restProfilePhoto" class="w-36 h-36 r-36 cover" />
                  </div>
                  <div
                    class="t-h6 c-text-black-high m-l-8 flex-1"
                  >{{ restaurantInfo.restaurantName }}</div>
                </div>-->
              </div>
              <!-- Notification Settings -->
              <div class="level-right">
                <notification-index :shopInfo="restaurantInfo"/>
              </div>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>

      <!-- Edit Body Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-24"></div>

        <!-- Left Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Restaurant Profile Photo -->
            <div class="m-t-24 align-center">
              <img :src="resizedProfileImage(restaurantInfo, '600')" class="w-64 h-64 r-64 cover" />
            </div>

            <!-- Restaurant Name -->
            <div
              class="m-t-8 align-center t-h6 c-text-black-high"
            >{{ restaurantInfo.restaurantName }}</div>

            <!-- Restaurant Descriptions -->
            <div
              class="t-body1 c-text-black-medium align-center m-t-8"
            >{{ restaurantInfo.introduction }}</div>

            <!-- Preview Link -->
            <div class="m-t-8 align-center">
              <nuxt-link target="_blank" :to="'/r/' + restaurantId()">
                <div class="op-button-text">
                  <i class="material-icons">launch</i>
                  <span>{{ $t("admin.viewPage") }}</span>
                </div>
              </nuxt-link>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- No Menu -->
            <div v-if="!existsMenu">
              <div class="border-primary r-8 p-l-24 p-r-24 p-t-24 p-b-24 m-t-24">
                <div class="align-center t-subtitle1 c-primary">{{ $t("editMenu.pleaseAddItem") }}</div>
                <div class="align-center">
                  <b-button
                    class="b-reset op-button-pill h-36 bg-form m-r-8 m-l-8 m-t-16"
                    :disabled="submitting"
                    @click="addTitle()"
                  >
                    <i class="material-icons c-primary m-l-8">add</i>
                    <span class="c-primary t-button">
                      {{
                      $t("button.addTitle")
                      }}
                    </span>
                  </b-button>
                  <b-button
                    class="b-reset op-button-pill h-36 bg-form m-l-8 m-r-8 m-t-16"
                    :disabled="submitting"
                    @click="addMenu()"
                  >
                    <i class="material-icons c-primary m-l-8">add</i>
                    <span class="c-primary t-button">
                      {{
                      $t("button.addItem")
                      }}
                    </span>
                  </b-button>
                </div>
              </div>
            </div>

            <!-- Category Titles / Menu Items -->
            <div v-if="existsMenu">
              <div v-for="(menuList, index) in menuLists" :key="menuList">
                <!-- Category Title -->
                <div
                  v-if="
                    itemsObj[menuList] &&
                      itemsObj[menuList]._dataType === 'title'
                  "
                >
                  <div v-if="editings[menuList] === true">
                    <title-input
                      :title="itemsObj[menuList]"
                      :position="
                        index == 0
                          ? 'first'
                          : menuLists.length - 1 === index
                          ? 'last'
                          : ''
                      "
                      @toEditMode="toEditMode($event)"
                      @positionUp="positionUp($event)"
                      @positionDown="positionDown($event)"
                      @forkItem="forkTitleItem($event)"
                      @updateTitle="updateTitle($event)"
                    ></title-input>
                  </div>
                  <div v-else>
                    <title-card
                      :title="itemsObj[menuList]"
                      :position="
                        index == 0
                          ? 'first'
                          : menuLists.length - 1 === index
                          ? 'last'
                          : ''
                      "
                      @toEditMode="toEditMode($event)"
                      @positionUp="positionUp($event)"
                      @positionDown="positionDown($event)"
                      @forkItem="forkTitleItem($event)"
                      @deleteItem="deleteItem($event)"
                    ></title-card>
                  </div>
                </div>

                <!-- Menu Item -->
                <div
                  v-else-if="
                    itemsObj[menuList] &&
                      itemsObj[menuList]._dataType === 'menu'
                  "
                >
                  <item-edit-card
                    :menuitem="itemsObj[menuList]"
                    :position="
                      index == 0
                        ? 'first'
                        : menuLists.length - 1 === index
                        ? 'last'
                        : ''
                    "
                    :shopInfo="restaurantInfo"
                    @positionUp="positionUp($event)"
                    @positionDown="positionDown($event)"
                    @forkItem="forkMenuItem($event)"
                    @deleteItem="deleteItem($event)"
                  ></item-edit-card>
                </div>
              </div>
            </div>

            <!-- Add Category Title / Menu Item -->
            <div class="align-center m-t-16">
              <!-- Add Category Title -->
              <b-button
                class="b-reset op-button-pill h-36 bg-form m-r-8 m-l-8 m-t-16"
                :disabled="submitting"
                @click="addTitle()"
              >
                <i class="material-icons c-primary m-l-8">add</i>
                <span class="c-primary t-button">
                  {{
                  $t("button.addTitle")
                  }}
                </span>
              </b-button>

              <!-- Add Menu Item -->
              <b-button
                class="b-reset op-button-pill h-36 bg-form m-l-8 m-r-8 m-t-16"
                :disabled="submitting"
                @click="addMenu()"
              >
                <i class="material-icons c-primary m-l-8">add</i>
                <span class="c-primary t-button">
                  {{
                  $t("button.addItem")
                  }}
                </span>
              </b-button>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import ItemEditCard from "~/app/admin/Menus/ItemEditCard";
import TitleCard from "~/app/admin/Menus/TitleCard";
import TitleInput from "~/app/admin/Menus/TitleInput";
import NotFound from "~/components/NotFound";
import BackButton from "~/components/BackButton";

import * as firebase from "firebase/app";

import NotificationIndex from "./Notifications/Index";

export default {
  name: "Menus",
  components: {
    ItemEditCard,
    TitleCard,
    TitleInput,
    BackButton,
    NotificationIndex,
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
  methods: {
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
