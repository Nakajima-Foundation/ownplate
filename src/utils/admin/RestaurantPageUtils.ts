import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { getCopyShopInfo, getEditShopInfo } from "./shopInfoPayload";
import { cleanObject } from "@/utils/utils";

import { db } from "@/lib/firebase/firebase9";
import {
  serverTimestamp,
  doc,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  setDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";

export const copyRestaurant = async (
  shopInfo: RestaurantInfoData,
  uid: string,
  restaurantId: string,
) => {
  const restaurantData = getEditShopInfo(shopInfo, serverTimestamp());
  restaurantData.restaurantName = restaurantData.restaurantName + " - COPY";
  const newRestaurantData = getCopyShopInfo(restaurantData, serverTimestamp());

  const restaurantDoc = await addDoc(
    collection(db, "restaurants"),
    cleanObject(newRestaurantData),
  );
  const id = restaurantDoc.id;

  const menuListIds: { [key: string]: string } = {};
  const menus = await getDocs(
    query(
      collection(db, `restaurants/${restaurantId}/menus`),
      where("deletedFlag", "==", false),
    ),
  );

  await Promise.all(
    menus.docs.map(async (a) => {
      const newMenu = await addDoc(
        collection(db, `restaurants/${id}/menus`),
        a.data(),
      );
      menuListIds[a.id] = newMenu.id;
    }),
  );
  // console.log(menus.docs);
  const titles = await getDocs(
    query(
      collection(db, `restaurants/${restaurantId}/titles`),
      where("deletedFlag", "==", false),
    ),
  );

  await Promise.all(
    titles.docs.map(async (a) => {
      const newMenu = await addDoc(
        collection(db, `restaurants/${id}/titles`),
        a.data(),
      );
      menuListIds[a.id] = newMenu.id;
    }),
  );

  const newMenuList: string[] = [];
  (shopInfo.menuLists || []).forEach((a) => {
    if (menuListIds[a]) {
      newMenuList.push(menuListIds[a]);
    }
  });

  await updateDoc(doc(db, `restaurants/${id}`), {
    menuLists: newMenuList,
    restaurantId: id,
  });

  // push list
  const path = `/admins/${uid}/public/RestaurantLists`;
  const restaurantListsDoc = await getDoc(doc(db, path));
  if (restaurantListsDoc.exists()) {
    const restaurantLists = restaurantListsDoc.data().lists;
    restaurantLists.push(id);
    await setDoc(doc(db, path), { lists: restaurantLists }, { merge: true });
  }

  return id;
  // end of list
};
