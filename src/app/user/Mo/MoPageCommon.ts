import {
  defineComponent,
  ref,
} from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import {
  getDocs,
  query,
  collection,
  where,
  documentId,
} from "firebase/firestore";

import MoPageSet from "@/app/user/Mo/MoPageSet.vue";
import MoPageMenu from "@/app/user/Mo/MoPageMenu.vue";
import MoPickUp from "@/app/user/Restaurant/MoPickUp.vue";

import { moBaseUrl, firebaseConfig } from "@/config/project";
import { SHA1, enc } from "crypto-js";

interface Menu {
  id: string;
  count: number;
};

interface SetMenu {
  id: string;
  setName: string;
  menus: Menu[];
};

export const getMenuId = (productId: string) => {
  const key = firebaseConfig.projectId + ":" + productId;
  const menuId = SHA1(key)
  return menuId.toString(enc.Hex);
};

export const moPage = (setMenus: SetMenu[]) => {
  return defineComponent({
    components: {
      MoPageSet,
      MoPageMenu,
      MoPickUp,
    },
    props: {
      pageId: {
        type: String,
        required: true,
      },
      pageBase: {
        type: String,
        required: true,
      },
      groupData: {
        type: Object,
        required: true,
      },
      orders: {
        type: Object,
        required: true,
      },
      selectedOptions: {
        type: Object,
        required: true,
      },
      shopInfo: {
        type: Object,
        required: true,
      },
      isPickup: {
        type: Boolean,
        required: true,
      },

      howtoreceive: {
        type: String,
        required: true,
      },
      disabledPickupTime: {
        type: Boolean,
        required: true,
      },
      noAvailableTime: {
        type: Boolean,
        required: false,
      },
      lastOrder: {
        type: String,
        required: false,
      },
      moPickupSuspend: {
        type: Boolean,
        required: false,
      },
    },
    setup(props, ctx) {
      const setMenuObj = setMenus.reduce((tmp: {[key: string]: SetMenu}, current) => {
        tmp[current.id] = current;
        return tmp;
      }, {});

      const menuDataObj = setMenus.reduce((tmp: {[key: string]: Menu}, current) => {
        current.menus.map(menu => {
          tmp[menu.id] = menu;
        });
        return tmp;
      }, {});

      const menuObj = ref<{[key: string]: any}>({});
      getDocs(
        query(
          collection(db, `restaurants/${props.groupData.restaurantId}/menus`),
          where("publicFlag", "==", true),
          where("deletedFlag", "==", false),
          where(documentId(), "in", Object.keys(menuDataObj))
        )
      ).then((menuQuerySnap) => {
        menuObj.value = menuQuerySnap.docs.reduce((tmp: {[key: string]: any}, m) => {
          const data = m.data();
          data.id = m.id;
          tmp[m.id] = data;
          return tmp;
        }, {});
      });

      const setQuantities = (itemId: string, newValue: number) => {
        const newQuantities = [newValue];
        ctx.emit("didOrderdChange", {
          itemId: itemId,
          quantities: newQuantities,
          itemData: menuObj.value[itemId],
          optionValues: [[]],
        });
      };
      
      const pushQuantities = (itemId: string, diff: number) => {
        setQuantities(itemId, ((props.orders[itemId]||{})[0] || 0) + diff);
      };
      const pullQuantities = (itemId: string, diff: number) => {
        if (((props.orders[itemId]||{})[0] || 0) > 0) {
          setQuantities(itemId, ((props.orders[itemId]||{})[0] || 0) - diff);
        }
      };

      const addSet = (setId: string) => {
        const setMenu = setMenuObj[setId];
        if (setMenu) {
          for (const item of setMenu.menus) {
            console.log(item);
            pushQuantities(item.id, item.count);
          }
        }
      };

      const updateHowtoreceive = (value: string) => {
        ctx.emit("input", value);
      };
      
      return {
        setMenus,
        setMenuObj,
        menuObj,

        pushQuantities,
        pullQuantities,

        addSet,
        updateHowtoreceive,

        moBaseUrl,
      };
    },
  });
};
