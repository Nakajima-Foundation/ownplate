import { ref } from "vue";
import { defineStore } from "pinia";

export const useGeneralStore = defineStore("generalStore", () => {
  const date = ref(new Date());

  const updateDate = () => {
    date.value = new Date();
  };

  return {
    date,
    updateDate
  };
});
