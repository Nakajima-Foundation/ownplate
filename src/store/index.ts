import { ref } from "vue";
import { defineStore } from "pinia";

export const useGeneralStore = defineStore("generalStore", () => {
  const date = ref(new Date());
  const orderEvent = ref(0);
  const soundEnable = ref(false); // maybe for debug (after user touch/click event, this flag set true (for mobile browser))

  const updateDate = () => {
    date.value = new Date();
  };

  const pingOrderEvent = () => {
    orderEvent.value = orderEvent.value + 1;
  };
  
  const setSoundEnable = () => {
    soundEnable.value = true;
  };

  
  
  return {
    date,
    updateDate,

    orderEvent,
    pingOrderEvent,

    soundEnable,
    setSoundEnable
  };
});
