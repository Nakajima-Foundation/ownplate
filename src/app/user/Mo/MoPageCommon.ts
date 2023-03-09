import {
  defineComponent,
  ref,
} from "vue";

import { db } from "@/lib/firebase/firebase9";
import {
  getDocs,
  query,
  collection,
  where,
  documentId,
} from "firebase/firestore";

import MoPageSet from "./MoPageSet.vue";
import MoPageMenu from "./MoPageMenu.vue";

interface Menu {
  id: string;
  count: number;
};

interface SetMenu {
  id: string;
  setName: string;
  menus: Menu[];
};
export const moPage = (setMenus: SetMenu[]) => {
  return defineComponent({
    components: {
      MoPageSet,
      MoPageMenu,
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
      
      return {
        setMenus,
        setMenuObj,
        menuObj,

        pushQuantities,
        pullQuantities,

        addSet,
      };
    },
  });
};
