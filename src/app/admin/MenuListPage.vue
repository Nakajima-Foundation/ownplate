<template>
  <div>
    <template v-if="notFound === null"></template>
    <template v-else-if="notFound === true">
      <not-found />
    </template>
    <div v-else-if="notFound === false">
      <!-- Header -->
      <div class="mt-6 mx-6 lg:flex lg:items-center">
        <!-- Back and Preview -->
        <div class="flex space-x-4">
          <div class="flex-shrink-0">
            <back-button url="/admin/restaurants/" />
          </div>
          <div class="flex-shrink-0">
            <router-link :to="'/r/' + restaurantId()">
              <div
                class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
              >
                <i class="material-icons text-lg text-op-teal mr-2">launch</i>
                <span class="text-sm font-bold text-op-teal">{{
                  $t("admin.viewPage")
                }}</span>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Photo and Name -->
        <div class="mt-4 lg:mt-0 lg:flex-1 lg:flex lg:items-center lg:mx-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 rounded-full bg-black bg-opacity-10 mr-4">
              <img
                :src="resizedProfileImage(restaurantInfo, '600')"
                class="w-9 h-9 rounded-full object-cover"
              />
            </div>
            <div class="text-base font-bold">
              {{ restaurantInfo.restaurantName }}
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="mt-4 lg:mt-0 flex-shrink-0">
          <notification-index :shopInfo="restaurantInfo" />
        </div>
      </div>

      <!-- Toggle to View All or Public Only -->
      <div class="mt-6 mx-6 lg:text-center">
        <a
          @click="publicFilterToggle()"
          class="inline-flex items-center rounded-full p-1 bg-green-600 bg-opacity-10"
        >
          <div v-if="publicFilter">
            <div class="inline-flex items-center rounded-full h-9 px-4">
              <div class="text-sm font-bold text-green-600">
                {{ $t("editMenu.showAllMenu") }}
              </div>
            </div>
            <div
              class="inline-flex items-center rounded-full h-9 px-4 bg-green-600"
            >
              <div class="text-sm font-bold text-white">
                {{ $t("editMenu.showPublicMenu") }}
              </div>
            </div>
          </div>

          <div v-else>
            <div
              class="inline-flex items-center rounded-full h-9 px-4 bg-green-600"
            >
              <div class="text-sm font-bold text-white">
                {{ $t("editMenu.showAllMenu") }}
              </div>
            </div>
            <div class="inline-flex items-center rounded-full h-9 px-4">
              <div class="text-sm font-bold text-green-600">
                {{ $t("editMenu.showPublicMenu") }}
              </div>
            </div>
          </div>
        </a>
      </div>

      <!-- No Menu or Too Many Menu-->
      <div
        v-if="(!existsMenu || menuCounter > 5) && isOwner"
        class="mt-6 mx-6 border-2 border-op-teal rounded-lg p-4 pb-2 lg:max-w-2xl lg:mx-auto"
      >
        <div class="text-center text-sm font-bold text-op-teal">
          {{ $t("editMenu.pleaseAddItem") }}
        </div>

        <div class="mt-4 text-center">
          <b-button
            @click="addTitle('top')"
            :disabled="submitting"
            class="b-reset-tw mx-2 mb-2"
          >
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">add</i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("button.addTitle")
              }}</span>
            </div>
          </b-button>

          <b-button
            @click="addMenu('top')"
            :disabled="submitting"
            class="b-reset-tw mx-2 mb-2"
          >
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">add</i>
              <span class="text-sm font-bold text-op-teal">
                {{ $t("button.addItem") }}</span
              >
            </div>
          </b-button>
        </div>
      </div>

      <!-- Category Titles / Menu Items -->
      <div
        v-if="existsMenu"
        class="mt-6 mx-6 grid-col-1 space-y-4 lg:max-w-2xl lg:mx-auto"
      >
        <div v-for="(menuList, index) in menuLists" :key="menuList">
          <!-- Category Title -->
          <div
            v-if="
              itemsObj[menuList] && itemsObj[menuList]._dataType === 'title'
            "
          >
            <div v-if="editings[menuList] === true">
              <title-input
                :title="itemsObj[menuList]"
                :position="
                  index == 0 ? 'first' : menuLength - 1 === index ? 'last' : ''
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
                  index == 0 ? 'first' : menuLength - 1 === index ? 'last' : ''
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
              itemsObj[menuList]._dataType === 'menu' &&
              (!publicFilter || itemsObj[menuList].publicFlag)
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

      <!-- Add Group Title, Menu Item, and Download Menu -->
      <div
        class="mt-6 mx-6 border-2 border-op-teal rounded-lg p-4 pb-2 lg:max-w-2xl lg:mx-auto"
        v-if="isOwner"
      >
        <div class="text-center">
          <b-button
            @click="addTitle()"
            :disabled="submitting"
            class="b-reset-tw mx-2 mb-2"
          >
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">add</i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("button.addTitle")
              }}</span>
            </div>
          </b-button>

          <b-button
            @click="addMenu()"
            :disabled="submitting"
            class="b-reset-tw mx-2 mb-2"
          >
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">add</i>
              <span class="text-sm font-bold text-op-teal">
                {{ $t("button.addItem") }}</span
              >
            </div>
          </b-button>
        </div>

        <div class="text-center mt-2" v-if="menuCounter > 0">
          <b-button
            @click="downloadMenu()"
            :disabled="downloadSubmitting"
            class="b-reset-tw mx-2 mb-2"
          >
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">menu_book</i>
              <span class="text-sm font-bold text-op-teal">
                {{ $t("button.downloadMenu") }}</span
              >
            </div>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/plugins/firebase";
import ItemEditCard from "@/app/admin/Menus/ItemEditCard";
import TitleCard from "@/app/admin/Menus/TitleCard";
import TitleInput from "@/app/admin/Menus/TitleInput";
import NotFound from "@/components/NotFound";
import BackButton from "@/components/BackButton";

import firebase from "firebase/compat/app";
import * as pdf from "@/lib/pdf/pdf";

import NotificationIndex from "./Notifications/Index";

import { cleanObject } from "@/utils/utils";

export default {
  name: "Menus",
  components: {
    ItemEditCard,
    TitleCard,
    TitleInput,
    BackButton,
    NotificationIndex,
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  metaInfo() {
    return {
      title: this.restaurantInfo.restaurantName
        ? [
            "Admin Menu List",
            this.restaurantInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  data() {
    return {
      submitting: false,
      downloadSubmitting: false,
      restaurantInfo: {},
      menuCollection: null,
      titleCollection: null,
      editings: {},
      detachers: [],
      notFound: null,
      menuObj: {},
      publicFilter: false,
    };
  },
  computed: {
    ownerUid() {
      return this.$store.getters.isSubAccount
        ? this.$store.getters.parentId
        : this.uid;
    },
    isOwner() {
      return !this.$store.getters.isSubAccount;
    },
    menuCounter() {
      return Object.keys(this.menuObj).length;
    },
    uid() {
      return this.$store.getters.uidAdmin;
    },
    existsMenu() {
      return this.menuLength > 0;
    },
    menuLength() {
      return this.menuLists.length;
    },
    itemsObj() {
      if (this.menuCollection && this.titleCollection) {
        const menus = (this.menuCollection.docs || []).map(
          this.doc2data("menu")
        );
        this.menuObj = this.array2obj(menus);
        const titles = (this.titleCollection.docs || []).map(
          this.doc2data("title")
        );
        return this.array2obj(menus.concat(titles));
      }
      return {};
    },
    menuLists() {
      return this.restaurantInfo.menuLists || [];
    },
    // TODO: create method and move to utils. merge ShopInfo.vue
    // TODO: merge restaurantInfo and shopInfo
    parsedNumber() {
      const countryCode =
        this.restaurantInfo.countryCode || this.countries[0].code;
      try {
        return parsePhoneNumber(countryCode + this.restaurantInfo.phoneNumber);
      } catch (error) {
        return null;
      }
    },
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
    nationalPhoneNumber() {
      const number = this.parsedNumber;
      if (number) {
        return formatNational(number);
      }
      return this.restaurantInfo.phoneNumber;
    },
  },
  async created() {
    this.checkAdminPermission();
    // allow sub Account
    if (!this.checkShopAccount(this.shopInfo)) {
      this.notFound = true;
      return;
    }

    // This is duplicate data with shopInfo. But DONT'T REMOVE THIS!!
    const restaurantRef = db.doc(`restaurants/${this.restaurantId()}`);
    const restaurant_detacher = restaurantRef.onSnapshot((results) => {
      if (results.exists && results.data().uid === this.ownerUid) {
        this.restaurantInfo = results.data();
        this.readyToDisplay = true;
        this.notFound = false;
      } else {
        this.notFound = true;
        // 404
        console.log("Error fetch restaurantInfo.");
      }
    });

    this.notFound = false;
    const menu_detacher = db
      .collection(`restaurants/${this.restaurantId()}/menus`)
      .where("deletedFlag", "==", false)
      .onSnapshot((results) => {
        this.menuCollection = results.empty ? {} : results;
        // for debug
        results.docs.forEach((a) => {
          if (a.data().publicFlag === undefined) {
            a.ref.update({ publicFlag: true });
          }
        });
      });
    const title_detacher = db
      .collection(`restaurants/${this.restaurantId()}/titles`)
      .where("deletedFlag", "==", false)
      .onSnapshot((results) => {
        this.titleCollection = results.empty ? {} : results;
      });
    this.detacher = [menu_detacher, title_detacher];
  },
  destroyed() {
    if (this.detachers) {
      this.detachers.map((detacher) => {
        detacher();
      });
    }
  },
  methods: {
    publicFilterToggle() {
      this.publicFilter = !this.publicFilter;
    },
    async downloadMenu() {
      this.downloadSubmitting = true;
      const dl = await pdf.menuDownload(
        this.restaurantInfo,
        this.menuObj,
        this.nationalPhoneNumber,
        this.shareUrl()
      );
      console.log(dl);
      this.downloadSubmitting = false;
    },
    async updateTitle(title) {
      await db
        .doc(`restaurants/${this.restaurantId()}/titles/${title.id}`)
        .update("name", title.name);
      this.changeTitleMode(title.id, false);
    },
    async addTitle(operation) {
      this.submitting = true;
      try {
        const data = {
          name: "",
          uid: this.$store.getters.uidAdmin,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          deletedFlag: false,
        };
        const newTitle = await db
          .collection(`restaurants/${this.restaurantId()}/titles`)
          .add(data);
        const newMenuLists = this.menuLists;
        // newMenuLists.unshift(newTitle.id);
        if (operation === "top") {
          newMenuLists.unshift(newTitle.id);
        } else {
          newMenuLists.push(newTitle.id);
        }
        await this.saveMenuList(newMenuLists);
      } catch (e) {
        console.log(e);
      } finally {
        this.submitting = false;
      }
    },
    async addMenu(operation) {
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
          createdAt: new Date(),
        };
        const newData = await db
          .collection(`restaurants/${this.restaurantId()}/menus`)
          .add(itemData);

        const newMenuLists = this.menuLists;
        if (operation === "top") {
          newMenuLists.unshift(newData.id);
        } else {
          newMenuLists.push(newData.id);
        }
        await this.saveMenuList(newMenuLists);
        this.$router.push({
          path: `/admin/restaurants/${this.restaurantId()}/menus/${newData.id}`,
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
        force: true,
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
      let pos = this.menuLists.indexOf(itemKey);
      if (pos !== 0 && pos !== -1) {
        const newMenuLists = [...this.menuLists];
        let tmp = null;
        do {
          tmp = newMenuLists[pos - 1];
          newMenuLists[pos - 1] = newMenuLists[pos];
          newMenuLists[pos] = tmp;
          pos = pos - 1;
          // if public filter case,
          //  loop swap while tmp obj is public or title. pos == 0 means you are top.
        } while (
          this.publicFilter &&
          this.menuObj[tmp] &&
          !this.menuObj[tmp].publicFlag &&
          pos !== 0
        );
        await this.saveMenuList(newMenuLists);
      }
    },
    async positionDown(itemKey) {
      let pos = this.menuLists.indexOf(itemKey);
      if (pos < this.menuLength - 1 && pos !== -1) {
        const newMenuLists = [...this.menuLists];
        let tmp = null;
        do {
          tmp = newMenuLists[pos + 1];
          newMenuLists[pos + 1] = newMenuLists[pos];
          newMenuLists[pos] = tmp;
          pos = pos + 1;
          // if public filter case,
          //  loop swap while tmp obj is public or title. pos == this.menuLength means you are bottom.
        } while (
          this.publicFilter &&
          this.menuObj[tmp] &&
          !this.menuObj[tmp].publicFlag &&
          pos < this.menuLength - 1
        );
        await this.saveMenuList(newMenuLists);
      }
    },
    async forkTitleItem(itemKey) {
      const item = this.itemsObj[itemKey];
      const data = {
        name: item.name,
        uid: this.uid,
        deletedFlag: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
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
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      const newData = await db
        .collection(`restaurants/${this.restaurantId()}/menus`)
        .add(cleanObject(data));
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
    },
  },
};
</script>
