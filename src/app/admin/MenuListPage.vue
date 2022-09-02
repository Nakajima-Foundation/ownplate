<template>
  <div>
    <template v-if="notFound === null"></template>
    <template v-else-if="notFound === true">
      <not-found />
    </template>
    <div v-else-if="notFound === false">
      <!-- Header -->
      <AdminHeader
        class="mt-6 mx-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        backLink="/admin/restaurants/"
        :showSuspend="false"
        :isInMo="isInMo"
        :moPrefix="moPrefix"
      />

      <template v-if="showCategory">
        <!-- Category view -->
        <div class="mt-6 mx-6 grid grid-col-1 space-y-2">
          <div class="text-xl font-bold text-black text-opacity-30">
            {{ $t("shopInfo.productCategory") }}
          </div>
          <CategoryList :categoryData="categoryData" />
        </div>
      </template>
      <template v-else>
        <!-- Toggle to View All or Public Only -->
        <div class="mt-6 mx-6 lg:text-center">
          <ToggleSwitch
            :toggleState="!publicFilter"
            @toggleFunction="publicFilterToggle()"
            onName="editMenu.showAllMenu"
            offName="editMenu.showPublicMenu"
          />
        </div>

        <!-- category for mo -->
        <div v-if="showSubCategory">
          <CategoryButton
            :shopInfo="shopInfo"
            :selectedCategory="selectedCategory"
          />
        </div>

        <!-- category for mo -->
        <div v-if="showSubCategory">
          <div class="mx-6 mt-2 lg:max-w-2xl lg:mx-auto">
            <SubCategoryList
              :subCategoryData="subCategoryData"
              :categoryBathPath="categoryBathPath"
              :subCategoryId="subCategory"
            />
          </div>
        </div>

        <!-- No Menu or Too Many Menu-->
        <div
          v-if="(!existsMenu || menuCounter > 5) && isOwner && !isInMo"
          class="mt-6 mx-6 border-2 border-op-teal rounded-lg p-4 pb-2 lg:max-w-2xl lg:mx-auto"
        >
          <div class="text-center text-sm font-bold text-op-teal">
            {{ $t("editMenu.pleaseAddItem") }}
          </div>

          <AddButton
            :submitting="submitting"
            @addTitle="addTitle('top')"
            @addMenu="addMenu('top')"
          />
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
                    index == 0
                      ? 'first'
                      : menuLength - 1 === index
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
                      : menuLength - 1 === index
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
                itemsObj[menuList]._dataType === 'menu' &&
                (!publicFilter || itemsObj[menuList].publicFlag)
              "
            >
              <menu-card
                :menuitem="itemsObj[menuList]"
                :position="
                  index == 0 ? 'first' : menuLength - 1 === index ? 'last' : ''
                "
                :shopInfo="shopInfo"
                :isInMo="isInMo"
                @positionUp="positionUp($event)"
                @positionDown="positionDown($event)"
                @forkItem="forkMenuItem($event)"
                @deleteItem="deleteItem($event)"
              ></menu-card>
            </div>
          </div>
        </div>

        <!-- Add Group Title, Menu Item, and Download Menu -->
        <div
          class="mt-6 mx-6 border-2 border-op-teal rounded-lg p-4 pb-2 lg:max-w-2xl lg:mx-auto"
          v-if="isOwner"
        >
          <AddButton
            :submitting="submitting"
            @addTitle="addTitle()"
            @addMenu="addMenu()"
            v-if="!isInMo"
          />

          <div class="text-center mt-2" v-if="menuCounter > 0">
            <DownloadButton :shopInfo="shopInfo" :menuObj="menuObj" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  watch,
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
import firebase from "firebase/compat/app";

import NotFound from "@/components/NotFound.vue";
import SubCategoryList from "@/app/user/Restaurant/SubCategoryList.vue";

import MenuCard from "@/app/admin/Menus/MenuCard.vue";
import TitleCard from "@/app/admin/Menus/TitleCard.vue";
import TitleInput from "@/app/admin/Menus/TitleInput.vue";

import ToggleSwitch from "@/components/ToggleSwitch.vue";
import AddButton from "@/app/admin/MenuListPage/AddButton.vue";
import PhotoName from "@/app/admin/MenuListPage/PhotoName.vue";
import DownloadButton from "@/app/admin/MenuListPage/DownloadButton.vue";
import CategoryList from "@/app/admin/MenuListPage/CategoryList.vue";
import CategoryButton from "@/app/admin/MenuListPage/CategoryButton.vue";

import AdminHeader from "@/app/admin/AdminHeader.vue";

import { useMenuAndTitle } from "@/app/admin/MenuListPage/Utils";

import { ownPlateConfig } from "@/config/project";

import { copyMenuData } from "@/models/menu";

import {
  useTitles,
  useCategory,
  useSubcategory,
  useMenu,
  useCategoryParams,
} from "@/app/user/Restaurant/Utils";

import { useAdminUids, cleanObject, notFoundResponse } from "@/utils/utils";
import { checkAdminPermission, checkShopAccount } from "@/utils/userPermission";
import { useAdminConfigToggle } from "@/utils/admin/Toggle";

export default defineComponent({
  name: "MenuList",
  components: {
    MenuCard,
    TitleCard,
    TitleInput,
    NotFound,

    AdminHeader,

    ToggleSwitch,
    AddButton,
    PhotoName,
    DownloadButton,

    SubCategoryList,
    CategoryList,
    CategoryButton,
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
    isInMo: {
      type: Boolean,
      required: true,
    },
    moPrefix: {
      type: String,
      required: false,
    },
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin Menu List",
            this.shopInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  setup(props, ctx) {
    const submitting = ref(false);
    const shopInfoSnapshot = ref({});

    const editings = ref({});
    const detachers = ref([]);
    const notFound = ref(null);

    if (!checkAdminPermission(ctx)) {
      return notFoundResponse;
    }

    const { isOwner, uid, ownerUid } = useAdminUids(ctx);

    const {
      category,
      subCategory,
      watchCat,
      hasCategory,
      showCategory,
      showSubCategory,
    } = useCategoryParams(ctx, props.isInMo);
    const { loadCategory, categoryData, categoryDataObj } = useCategory(
      props.moPrefix
    );

    const { subCategoryData, loadSubcategory } = useSubcategory(
      props.moPrefix,
      category
    );
    const selectedCategory = computed(() => {
      return categoryDataObj.value[category.value] || {};
    });
    watch(category, () => {
      if (category.value) {
        loadSubcategory();
      }
    });
    if (props.isInMo) {
      loadCategory();
      if (category.value) {
        loadSubcategory();
      }
    }
    const categoryBathPath = computed(() => {
      return `/admin/restaurants/${restaurantId.value}/menus/cat/${category.value}`;
    });
    // end of category

    const menuRestaurantId = computed(() => {
      return props.isInMo
        ? props.groupMasterRestaurant.restaurantId
        : ctx.root.$route.params.restaurantId;
    });
    const restaurantId = computed(() => {
      return ctx.root.$route.params.restaurantId;
    });
    const menuCounter = computed(() => {
      return Object.keys(menuObj.value).length;
    });

    // allow sub Account
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }

    // This is duplicate data with shopInfo. But DONT'T REMOVE THIS!!
    // Menu list is saved in restaurant info. This data needs reactive.
    notFound.value = false;
    const restaurant_detacher = onSnapshot(
      doc(db, `restaurants/${restaurantId.value}`),
      (results) => {
        if (results.exists && results.data().uid === ownerUid.value) {
          shopInfoSnapshot.value = results.data();
          notFound.value = false;
        } else {
          notFound.value = true;
          // 404
          console.log("Error fetch shopInfoSnapshot.");
        }
      }
    );
    onUnmounted(() => {
      restaurant_detacher();
    });

    const { menuObj, itemsObj, numberOfMenus, loadMenu } = useMenuAndTitle(
      menuRestaurantId,
      props.isInMo,
      category,
      subCategory
    );

    const menuLists = computed(() => {
      return props.isInMo
        ? Object.keys(itemsObj.value)
        : shopInfoSnapshot.value.menuLists || [];
    });
    const menuLength = computed(() => {
      return menuLists.value.length;
    });
    const existsMenu = computed(() => {
      return menuLength.value > 0;
    });

    watch(watchCat, () => {
      loadMenu();
    });
    loadMenu();

    const { toggle: publicFilter, switchToggle: publicFilterToggle } =
      useAdminConfigToggle("menuPublicFilter", uid.value, false);

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
    const saveMenuList = async (newMenuLists) => {
      await updateDoc(doc(db, `restaurants/${restaurantId.value}`), {
        menuLists: newMenuLists,
        numberOfMenus: numberOfMenus.value,
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

      const data = copyMenuData(
        item,
        ownPlateConfig.region === "JP",
        uid.value
      );
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
      menuObj,

      // methods
      publicFilterToggle,
      updateTitle,
      toEditMode,
      addTitle,
      addMenu,
      positionUp,
      positionDown,
      forkTitleItem,
      forkMenuItem,
      deleteItem,

      // category,
      categoryData,
      subCategoryData,
      selectedCategory,

      showCategory,
      showSubCategory,
      categoryBathPath,
      subCategory,
    };
  },
});
</script>
