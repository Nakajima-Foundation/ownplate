<template>
  <div>
    <template v-if="notFound === null"></template>
    <template v-else-if="notFound === true">
      <not-found />
    </template>
    <div v-else-if="notFound === false">
      <!-- Header -->
      <AdminHeader
        class="mx-6 mt-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="`/admin/restaurants/#restaurant_` + shopInfo.restaurantId"
        :showSuspend="false"
        pageText="menuList"
      />

      <!-- Toggle to View All or Public Only -->
        <!-- Toggle to View All or Public Only -->
        <div class="mx-6 mt-6 lg:text-center">
          <ToggleSwitch2
            v-model="toggleStatus"
            :toggleValues="toggleValues"
          />
        </div>
        <!-- No Menu or Too Many Menu-->
        <div
          v-if="(!existsMenu || menuCounter > 5) && isOwner"
          class="mx-6 mt-6 rounded-lg border-2 border-op-teal p-4 pb-2 lg:mx-auto lg:max-w-2xl"
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
          class="grid-col-1 mx-6 mt-6 space-y-4 lg:mx-auto lg:max-w-2xl"
        >
          <div v-for="(menuList, index) in menuLists" :key="menuList">
            <!-- Category Title -->
            <div
              v-if="
                itemsObj[menuList] && itemsObj[menuList]._dataType === 'title'
              "
              :id="itemsObj[menuList].id"
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
                <TitleView
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
                />
              </div>
            </div>

            <!-- Menu Item -->
            <div
              v-else-if="
                itemsObj[menuList] &&
                itemsObj[menuList]._dataType === 'menu' &&
                (showAllItems || showPublicItems && itemsObj[menuList].publicFlag || showSoldOutItems && itemsObj[menuList].soldOut)
              "
              :id="itemsObj[menuList].id"
              >
              <MenuView
                :menuitem="itemsObj[menuList]"
                :position="
                  index == 0 ? 'first' : menuLength - 1 === index ? 'last' : ''
                "
                :shopInfo="shopInfo"
                @positionUp="positionUp($event)"
                @positionDown="positionDown($event)"
                @forkItem="forkMenuItem($event)"
                @deleteItem="deleteItem($event)"
              />
            </div>
          </div>
        </div>

        <!-- Add Group Title, Menu Item, and Download Menu -->
        <div
          class="mx-6 mt-6 rounded-lg border-2 border-op-teal p-4 pb-2 lg:mx-auto lg:max-w-2xl"
          v-if="isOwner"
        >
          <AddButton
            :submitting="submitting"
            @addTitle="addTitle()"
            @addMenu="addMenu()"
          />

          <div class="mt-2 text-center" v-if="menuCounter > 0">
            <DownloadButton :shopInfo="shopInfo" :menuObj="menuObj" />
          </div>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onUnmounted,
  PropType,
} from "vue";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import NotFound from "@/components/NotFound.vue";

import MenuView from "@/app/admin/Restaurants/MenuListPage/Menu.vue";
import TitleView from "@/app/admin/Restaurants/MenuListPage/Title.vue";
import TitleInput from "@/app/admin/Restaurants/MenuListPage/TitleInput.vue";

import ToggleSwitch2 from "@/components/ToggleSwitch2.vue";
import AddButton from "@/app/admin/Restaurants/MenuListPage/AddButton.vue";
import DownloadButton from "@/app/admin/Restaurants/MenuListPage/DownloadButton.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import { useMenuAndTitle } from "@/app/admin/Restaurants/MenuListPage/Utils";

import { ownPlateConfig } from "@/config/project";

import { copyMenuData, MenuData } from "@/models/menu";

import { useAdminUids, cleanObject, notFoundResponse } from "@/utils/utils";
import { checkShopAccount } from "@/utils/userPermission";
import { useAdminConfigToggle2 } from "@/utils/admin/Toggle";

import { useRouter, useRoute } from "vue-router";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

import {
  sleep,
  scrollToElementById,
} from "@/utils/utils";


export default defineComponent({
  name: "MenuList",
  components: {
    MenuView,
    TitleView,
    TitleInput,
    NotFound,

    AdminHeader,

    ToggleSwitch2,
    AddButton,
    DownloadButton,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
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
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    const submitting = ref(false);
    const shopInfoSnapshot = ref<RestaurantInfoData|Record<string, never>>({});

    const editings = ref<{[key: string]: boolean}>({});
    const notFound = ref<boolean | null>(null);

    const { isOwner, uid, ownerUid } = useAdminUids();

    const restaurantId = computed(() => {
      return route.params.restaurantId as string;
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
        if (results.exists() && results.data().uid === ownerUid.value) {
          shopInfoSnapshot.value = results.data() as RestaurantInfoData;
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

    const { menuObj, itemsObj, numberOfMenus, loadMenu, isLoading } =
      useMenuAndTitle(restaurantId);

    const menuLists = computed(() => {
      return (shopInfoSnapshot.value as RestaurantInfoData).menuLists || [];
    });
    const menuLength = computed(() => {
      return menuLists.value.length;
    });
    const existsMenu = computed(() => {
      return menuLength.value > 0;
    });

    loadMenu();

    // mo
    watch(isLoading, (value) => {
      if (!value) {
        // finish load
        if (
          numberOfMenus.value > 0 &&
            numberOfMenus.value !== props.shopInfo?.numberOfMenus
        ) {
          updateDoc(doc(db, `restaurants/${restaurantId.value}`), {
            numberOfMenus: numberOfMenus.value,
          });
        }
      }
    });

    const { toggle: toggleStatus } =
      useAdminConfigToggle2("menuToggleSwitch", uid.value, 0, true);
    const toggleValues = [{
      name: "showAllMenu",
      value: "all",
    }, {
      name: "showPublicMenu",
      value: "public",
    }, {
      name: "showSoldOutMenu",
      value: "soldout",
    }];
     
    const showPublicItems = computed(() => {
      return toggleValues[toggleStatus.value].value === "public"
    });
    const showAllItems = computed(() => {
      return toggleValues[toggleStatus.value].value === "all"
    });
    const showSoldOutItems = computed(() => {
      return toggleValues[toggleStatus.value].value === "soldout"
    });
    

    const changeTitleMode = (titleId: string, value: boolean) => {
      const newEditings = { ...editings.value };
      newEditings[titleId] = value;
      editings.value = newEditings;
    };
    const updateTitle = async (title: any) => {
      await updateDoc(
        doc(db, `restaurants/${restaurantId.value}/titles/${title.id}`),
        { name: title.name }
      );
      changeTitleMode(title.id, false);
    };
    // edit title
    const toEditMode = (titleId: string) => {
      changeTitleMode(titleId, true);
    };
    // end of edit title
    const saveMenuList = async (newMenuLists: string[]) => {
      await updateDoc(doc(db, `restaurants/${restaurantId.value}`), {
        menuLists: newMenuLists,
        numberOfMenus: numberOfMenus.value,
      });
    };
    const addTitle = async (operation: string) => {
      submitting.value = true;
      try {
        const data = {
          name: "",
          uid: uid.value,
          createdAt: serverTimestamp(),
          deletedFlag: false,
        };
        const newTitle = await addDoc(
          collection(db, `restaurants/${restaurantId.value}/titles`),
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
    const addMenu = async (operation: string) => {
      submitting.value = true;
      try {
        const itemData = {
          itemName: "",
          itemAliasesName: "",
          price: 0,
          tax: "food",
          itemDescription: "",
          itemMemo: "",
          uid: uid.value,
          availableLunch: true,
          availableDinner: true,
          deletedFlag: false,
          publicFlag: true,
          validatedFlag: false,
          createdAt: new Date(),
        };
        const newData = await addDoc(
          collection(db, `restaurants/${restaurantId.value}/menus`),
          itemData
        );

        const newMenuLists = menuLists.value;
        if (operation === "top") {
          newMenuLists.unshift(newData.id);
        } else {
          newMenuLists.push(newData.id);
        }
        await saveMenuList(newMenuLists);
        router.push({
          path: `/admin/restaurants/${restaurantId.value}/menus/${newData.id}`,
        });
      } catch (e) {
        console.log(e);
      } finally {
        submitting.value = false;
      }
    };
    //
    const positionUp = async (itemKey: string) => {
      let pos = menuLists.value.indexOf(itemKey);
      if (pos !== 0 && pos !== -1) {
        const newMenuLists = [...menuLists.value];
        let tmp = null;
        do {
          tmp = newMenuLists[pos - 1];
          newMenuLists[pos - 1] = newMenuLists[pos];
          newMenuLists[pos] = tmp;
          pos = pos - 1;
        } while (
          menuObj.value[tmp] && // don't move. side effect.
          (
            (showPublicItems.value && !menuObj.value[tmp].publicFlag) ||
            (showSoldOutItems.value && !menuObj.value[tmp].soldOut)
          ) &&
          pos !== 0 // if public filter case, loop swap while tmp obj is public or title. pos == 0 means you are top.
        );
        await saveMenuList(newMenuLists);
      }
    };
    const positionDown = async (itemKey: string) => {
      let pos = menuLists.value.indexOf(itemKey);
      if (pos < menuLength.value - 1 && pos !== -1) {
        const newMenuLists = [...menuLists.value];
        let tmp = null;
        do {
          tmp = newMenuLists[pos + 1];
          newMenuLists[pos + 1] = newMenuLists[pos];
          newMenuLists[pos] = tmp;
          pos = pos + 1;
        } while (
          menuObj.value[tmp] && // don't move. side effect.
          (
            (showPublicItems.value && !menuObj.value[tmp].publicFlag) ||
            (showSoldOutItems.value && !menuObj.value[tmp].soldOut)
          ) &&
          pos < menuLength.value - 1 // if public filter case, loop swap while tmp obj is public or title. pos == menuLength.value means you are bottom.
        );
        await saveMenuList(newMenuLists);
      }
    };

    const forkItem = async (itemKey: string, newData: MenuData) => {
      const pos = menuLists.value.indexOf(itemKey);

      const newMenuLists = menuLists.value;
      newMenuLists.splice(pos, 0, newData.id);
      await saveMenuList(newMenuLists);
    };
    const scroll = async (id: string) => {
      if (toggleStatus.value !== 0) {
        toggleStatus.value = 0;
        await sleep(0.4);
        scrollToElementById(id)
      }
    }
    const forkTitleItem = async (itemKey: string) => {
      const item = itemsObj.value[itemKey];
      const data = {
        name: item.name,
        uid: uid.value,
        deletedFlag: false,
        createdAt: serverTimestamp(),
      };
      const newTitle = await addDoc(
        collection(db, `restaurants/${restaurantId.value}/titles`),
        data
      );
      await forkItem(itemKey, newTitle as any);
      await scroll(newTitle.id);
    };

    const forkMenuItem = async (itemKey: string) => {
      const item = itemsObj.value[itemKey];
      const data = copyMenuData(
        item as MenuData,
        ownPlateConfig.region === "JP",
        uid.value
      );
      const newData = await addDoc(
        collection(db, `restaurants/${restaurantId.value}/menus`),
        cleanObject(data)
      );
      await forkItem(itemKey, newData as any);
      await scroll(newData.id);
    };

    const deleteItem = async (itemKey: string) => {
      // delete from list
      const newMenuLists = menuLists.value;
      const pos = newMenuLists.indexOf(itemKey);
      const item = itemsObj.value[itemKey];
      menuLists.value.splice(pos, 1);
      if (item._dataType === "menu") {
        await updateDoc(
          doc(db, `restaurants/${restaurantId.value}/menus/${itemKey}`),
          { deletedFlag: true }
        );
      }
      if (item._dataType === "title") {
        await updateDoc(
          doc(db, `restaurants/${restaurantId.value}/titles/${itemKey}`),
          { deletedFlag: true }
        );
      }
      await saveMenuList(newMenuLists);
    };

    return {
      toggleStatus,
      toggleValues,

      //ref
      submitting,
      editings,
      notFound,

      showPublicItems,
      showAllItems,
      showSoldOutItems,
      
      // computed
      isOwner,
      menuCounter,
      menuLists,
      menuLength,
      existsMenu,
      itemsObj,
      menuObj,

      // methods
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
