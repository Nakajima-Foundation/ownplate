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
                :src="resizedProfileImage(shopInfo, '600')"
                class="w-9 h-9 rounded-full object-cover"
              />
            </div>
            <div class="text-base font-bold">
              {{ shopInfo.restaurantName }}
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="mt-4 lg:mt-0 flex-shrink-0">
          <notification-index :shopInfo="shopInfo" />
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
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
} from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import ItemEditCard from "@/app/admin/Menus/ItemEditCard";
import TitleCard from "@/app/admin/Menus/TitleCard";
import TitleInput from "@/app/admin/Menus/TitleInput";
import NotFound from "@/components/NotFound";
import BackButton from "@/components/BackButton";

import firebase from "firebase/compat/app";
import * as pdf from "@/lib/pdf/pdf";

import { ownPlateConfig } from "@/config/project";

import { copyMenuData } from "@/models/menu";

import NotificationIndex from "./Notifications/Index";

import { doc2data, useAdminUids, cleanObject, array2obj, shareUrl } from "@/utils/utils";
import { checkAdminPermission, checkShopAccount } from "@/utils/userPermission/";

export default defineComponent({
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
    groupMasterRestaurant: {
      type: Object,
      required: false,
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
  setup(props, ctx) {
    const submitting = ref(false);
    const downloadSubmitting = ref(false);
    const restaurantInfo = ref({});
    const menuCollection = ref(null);
    const titleCollection = ref(null);
    const editings = ref({});
    const detachers = ref([]);
    const notFound = ref(null);
    const menuObj = ref({});
    const publicFilter = ref(false);
    if (!checkAdminPermission(ctx)) {
      return;
    }
    
    const {
      isOwner,
      uid,
      ownerUid,
    } = useAdminUids(ctx);

    const menuRestaurantId = computed(() => {
      console.log(props.groupMasterRestaurant);
      return props.groupMasterRestaurant ?
        props.groupMasterRestaurant.restaurantId :
        ctx.root.$route.params.restaurantId;
    });
    const restaurantId = computed(() => {
      return ctx.root.$route.params.restaurantId;
    });
    const menuCounter = computed(() => {
      return Object.keys(menuObj.value).length;
    });
    const menuLists = computed(() => {
      return restaurantInfo.value.menuLists || [];
    });
    const menuLength = computed(() => {
      return menuLists.value.length;
    });
    const existsMenu = computed(() => {
      return menuLength.value > 0;
    });
    const itemsObj = computed(() => {
      if (menuCollection.value && titleCollection.value) {
        const menus = (menuCollection.value.docs || []).map(
          doc2data("menu")
        );
        menuObj.value = array2obj(menus);
        const titles = (titleCollection.value.docs || []).map(
          doc2data("title")
        );
        return array2obj(menus.concat(titles));
      }
      return {};
    });
    const countries = computed(() => { 
      return ctx.root.$store.getters.stripeRegion.countries;
    });
    // TODO: create method and move to utils. merge ShopInfo.vue
    // TODO: merge restaurantInfo and shopInfo
    const parsedNumber = computed(() => {
      const countryCode =
            restaurantInfo.value.countryCode || countries.value[0].code;
      try {
        return parsePhoneNumber(countryCode + restaurantInfo.value.phoneNumber);
      } catch (error) {
        return null;
      }
    });
    const nationalPhoneNumber = computed(() => {
      const number = parsedNumber.value;
      if (number) {
        return formatNational(number);
      }
      return restaurantInfo.value.phoneNumber;
    });

    // allow sub Account
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      notFound.value = true;
      return;
    }

    // This is duplicate data with shopInfo. But DONT'T REMOVE THIS!!
    // Menus and titles are saved restaurant info. This is reactive.
    const restaurantRef = doc(db, `restaurants/${restaurantId.value}`);
    const restaurant_detacher = onSnapshot(restaurantRef, (results) => {
      if (results.exists && results.data().uid === ownerUid.value) {
        restaurantInfo.value = results.data();
        notFound.value = false;
      } else {
        notFound.value = true;
        // 404
        console.log("Error fetch restaurantInfo.");
      }
    });

    notFound.value = false;

    const menu_detacher = onSnapshot(
      query(
        collection(db, `restaurants/${menuRestaurantId.value}/menus`),
        where("deletedFlag", "==", false)
      ),
      (results) => {
        menuCollection.value = results.empty ? {} : results;
        // for debug
        results.docs.forEach((a) => {
          if (a.data().publicFlag === undefined) {
            a.ref.update({ publicFlag: true });
          }
        });
      }
    );
    const title_detacher = onSnapshot(
      query(
        collection(db, `restaurants/${menuRestaurantId.value}/titles`),
        where("deletedFlag", "==", false)
      ),
      (results) => {
        titleCollection.value = results.empty ? {} : results;
      }
    );
    detachers.value = [restaurant_detacher, menu_detacher, title_detacher];

    onUnmounted(() => {
      if (detachers.value) {
        detachers.value.map((detacher) => {
          detacher();
        });
        detachers.value = [];
      }
    });

    const publicFilterToggle = () => {
      publicFilter.value = !publicFilter.value;
    };
    const downloadMenu = async () => {
      downloadSubmitting.value = true;
      const dl = await pdf.menuDownload(
        restaurantInfo.value,
        menuObj.value,
        nationalPhoneNumber.value,
        shareUrl(ctx.root)
      );
      downloadSubmitting.value = false;
    };
    const changeTitleMode = (titleId, value) => {
      const newEditings = { ...editings.value };
      newEditings[titleId] = value;
      editings.value = newEditings;
    };
    const updateTitle = async (title) => {
      await updateDoc(
        doc(db, `restaurants/${menuRestaurantId.value}/titles/${title.id}`),
        { name: title.name }
      );
      changeTitleMode(title.id, false);
    };
    // edit title
    const toEditMode = (titleId) => {
      changeTitleMode(titleId, true);
    };
    // end of edit title
    const saveMenuList = async (menuLists) => {
      const numberOfMenus = menuCollection.value.docs.length;
      await updateDoc(doc(db, `restaurants/${restaurantId.value}`), {
        menuLists,
        numberOfMenus,
      });
    };
    const addTitle = async (operation) => {
      submitting.value = true;
      try {
        const data = {
          name: "",
          uid: uid.value,
          createdAt: serverTimestamp(),
          deletedFlag: false,
        };
        const newTitle = await addDoc(
          collection(db, `restaurants/${menuRestaurantId.value}/titles`),
          data
        );
        const newMenuLists = menuLists.value;
        // newMenuLists.unshift(newTitle.id);
        if (operation === "top") {
          newMenuLists.unshift(newTitle.id);
        } else {
          newMenuLists.push(newTitle.id);
        }
        await saveMenuList(newMenuLists);
      } catch (e) {
        console.log(e);
      } finally {
        submitting.value = false;
      }
    };
    const addMenu = async (operation) => {
      submitting.value = true;
      try {
        const itemData = {
          itemName: "",
          price: 0,
          tax: "food",
          itemDescription: "",
          uid: uid.value,
          deletedFlag: false,
          publicFlag: true,
          validatedFlag: false,
          createdAt: new Date(),
        };
        const newData = await addDoc(
          collection(db, `restaurants/${menuRestaurantId.value}/menus`),
          itemData
        );

        const newMenuLists = menuLists.value;
        if (operation === "top") {
          newMenuLists.unshift(newData.id);
        } else {
          newMenuLists.push(newData.id);
        }
        await saveMenuList(newMenuLists);
        ctx.root.$router.push({
          path: `/admin/restaurants/${menuRestaurantId.value}/menus/${newData.id}`,
        });
      } catch (e) {
        console.log(e);
      } finally {
        submitting.value = false;
      }
    };
    //
    const positionUp = async (itemKey) => {
      let pos = menuLists.value.indexOf(itemKey);
      if (pos !== 0 && pos !== -1) {
        const newMenuLists = [...menuLists.value];
        let tmp = null;
        do {
          tmp = newMenuLists[pos - 1];
          newMenuLists[pos - 1] = newMenuLists[pos];
          newMenuLists[pos] = tmp;
          pos = pos - 1;
          // if public filter case,
          //  loop swap while tmp obj is public or title. pos == 0 means you are top.
        } while (
          publicFilter.value &&
          menuObj.value[tmp] &&
          !menuObj.value[tmp].publicFlag &&
          pos !== 0
        );
        await saveMenuList(newMenuLists);
      }
    };
    const positionDown = async (itemKey) => {
      let pos = menuLists.value.indexOf(itemKey);
      if (pos < menuLength.value - 1 && pos !== -1) {
        const newMenuLists = [...menuLists.value];
        let tmp = null;
        do {
          tmp = newMenuLists[pos + 1];
          newMenuLists[pos + 1] = newMenuLists[pos];
          newMenuLists[pos] = tmp;
          pos = pos + 1;
          // if public filter case,
          //  loop swap while tmp obj is public or title. pos == menuLength.value means you are bottom.
        } while (
          publicFilter.value &&
          menuObj.value[tmp] &&
          !menuObj.value[tmp].publicFlag &&
          pos < menuLength.value - 1
        );
        await saveMenuList(newMenuLists);
      }
    };

    const forkItem = async (itemKey, newData) => {
      const pos = menuLists.value.indexOf(itemKey);
      const item = itemsObj.value[itemKey];

      const newMenuLists = menuLists.value;
      newMenuLists.splice(pos, 0, newData.id);
      await saveMenuList(newMenuLists);
    };

    const forkTitleItem = async (itemKey) => {
      const item = itemsObj.value[itemKey];
      const data = {
        name: item.name,
        uid: uid.value,
        deletedFlag: false,
        createdAt: serverTimestamp(),
      };
      const newTitle = await addDoc(
        collection(db, `restaurants/${menuRestaurantId.value}/titles`),
        data
      );
      await forkItem(itemKey, newTitle);
    };

    const forkMenuItem = async (itemKey) => {
      const item = itemsObj.value[itemKey];

      const data = copyMenuData(item, ownPlateConfig.region === "JP", uid.value);
      const newData = await addDoc(
        collection(db, `restaurants/${menuRestaurantId.value}/menus`),
        cleanObject(data)
      );
      await forkItem(itemKey, newData);
    };

    const deleteItem = async (itemKey) => {
      // delete from list
      const newMenuLists = menuLists.value;
      const pos = newMenuLists.indexOf(itemKey);
      const item = itemsObj.value[itemKey];
      menuLists.value.splice(pos, 1);
      if (item._dataType === "menu") {
        await updateDoc(
          doc(db, `restaurants/${menuRestaurantId.value}/menus/${itemKey}`),
          { deletedFlag: true }
        );
      }
      if (item._dataType === "title") {
        await updateDoc(
          doc(db, `restaurants/${menuRestaurantId.value}/titles/${itemKey}`),
          { deletedFlag: true }
        );
      }
      await saveMenuList(newMenuLists);
    };
    return {
      //ref
      submitting,
      downloadSubmitting,
      restaurantInfo,
      editings,
      notFound,
      publicFilter,

      // computed
      isOwner,
      menuCounter,
      menuLists,
      menuLength,
      existsMenu,
      itemsObj,
      
      // methods
      publicFilterToggle,
      downloadMenu,
      updateTitle,
      toEditMode,
      addTitle,
      addMenu,
      positionUp,
      positionDown,
      forkTitleItem,
      forkMenuItem,
      deleteItem,
    };
  },
});
</script>
