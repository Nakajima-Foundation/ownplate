import { ref } from "vue";
import { defineStore } from "pinia";

interface DialogAlertData {
  title: string;
  code: string;
  callback: () => void;
}
interface DialogErrorData {
  message: string;
  message2: string;
  code: string;
}
interface DialogTipsData {
  key: string;
}
interface Dialog {
  alert?: DialogAlertData;
  error?: DialogErrorData;
  tips?: DialogTipsData;
}

export const useDialogStore = defineStore("dialogStore", () => {
  const dialog = ref<null | Dialog>(null);

  const resetDialog = () => {
    dialog.value = null;
  };
  const setAlert = (params: DialogAlertData) => {
    dialog.value = { alert: params };
  };
  const setErrorMessage = (params: DialogErrorData) => {
    dialog.value = { error: params };
  };
  const setTips = (params: DialogTipsData) => {
    dialog.value = { tips: params };
  };

  return {
    dialog,
    resetDialog,
    setAlert,
    setErrorMessage,
    setTips,
  };
});
