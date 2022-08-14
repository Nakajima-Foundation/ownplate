import {
  ref,
  onUnmounted,
} from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
} from "firebase/firestore";


export const useAdminConfigToggle = (key: string, uid: string, defaultValue: boolean) => {
  const toggle = ref(true);
  const switchToggle = () => {
    setDoc(
      doc(db, `adminConfigs/${uid}`),
      {[key]: !toggle.value},
      { merge: true }
    );
  };
  
  const detacher = onSnapshot(
    doc(db, `adminConfigs/${uid}`),
    (res) => {
      const config = res.data()||{};
      toggle.value = config[key] === undefined ? defaultValue : config[key];
    }
  );
  onUnmounted(() => {
    detacher();
  });
  return {
    toggle,
    switchToggle,
  };
};
