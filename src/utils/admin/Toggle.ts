import { ref, onUnmounted, watch } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";

import {
  adminConfigPath,
  adminRestaurantConfigPath,
  configValueOr,
} from "./adminConfig";

export const useAdminConfigToggle = (
  key: string,
  uid: string,
  defaultValue: boolean,
) => {
  const toggle = ref(true);
  const path = adminConfigPath(uid);
  const switchToggle = () => {
    setDoc(doc(db, path), { [key]: !toggle.value }, { merge: true });
  };

  const detacher = onSnapshot(doc(db, path), (res) => {
    toggle.value = configValueOr<boolean>(res.data(), key, defaultValue);
  });
  onUnmounted(() => {
    detacher();
  });
  return {
    toggle,
    switchToggle,
  };
};

export const useAdminConfigToggle2 = (
  key: string,
  uid: string,
  restaurantId: string,
  defaultValue: number,
  enableSave: boolean,
) => {
  const toggle = ref(defaultValue);
  const path = adminRestaurantConfigPath(uid, restaurantId);
  const switchToggle = () => {
    setDoc(doc(db, path), { [key]: toggle.value }, { merge: true });
  };

  getDoc(doc(db, path)).then((res) => {
    toggle.value = configValueOr<number>(res.data(), key, defaultValue);
  });

  watch(toggle, () => {
    if (enableSave) {
      switchToggle();
    }
  });

  return {
    toggle,
    switchToggle,
  };
};
