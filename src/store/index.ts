import { ref } from "vue";
import { defineStore } from "pinia";

export const useGeneralStore = defineStore("generalStore", () => {
  const date = ref(new Date());
  const orderEvent = ref(0);

  const updateDate = () => {
    date.value = new Date();
  };

  const pingOrderEvent = () => {
    orderEvent.value = orderEvent.value + 1;
  };

  const soundEnable = ref(false); // maybe for debug (after user touch/click event, this flag set true (for mobile browser))
  const setSoundEnable = () => {
    soundEnable.value = true;
  };

  const soundOn = ref(false); // for restaurant admin config
  const setSoundOn = (flag: boolean) => {
    soundOn.value = flag;
  };

  const soundFile = ref("");
  const setSoundFile = (file: string) => {
    soundFile.value = file;
  };

  const isWindowActive = ref(false);
  const setActive = (flag: boolean) => {
    isWindowActive.value = flag;
  };

  return {
    date,
    updateDate,

    orderEvent,
    pingOrderEvent,

    soundEnable,
    setSoundEnable,

    soundOn,
    setSoundOn,

    soundFile,
    setSoundFile,

    isWindowActive,
    setActive,
  };
});
