import { ref, onUnmounted, watch } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";

export const useAdminConfigToggle = (
  key: string,
  uid: string,
  defaultValue: boolean,
) => {
  const toggle = ref(true);
  const switchToggle = () => {
    setDoc(
      doc(db, `adminConfigs/${uid}`),
      { [key]: !toggle.value },
      { merge: true },
    );
  };

  const detacher = onSnapshot(doc(db, `adminConfigs/${uid}`), (res) => {
    const config = res.data() || {};
    toggle.value = config[key] === undefined ? defaultValue : config[key];
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
  const path = `adminConfigs/${uid}/restaurants/${restaurantId}`;
  const switchToggle = () => {
    setDoc(doc(db, path), { [key]: toggle.value }, { merge: true });
  };

  getDoc(doc(db, path)).then((res) => {
    const config = res.data() || {};
    toggle.value = config[key] === undefined ? defaultValue : config[key];
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
