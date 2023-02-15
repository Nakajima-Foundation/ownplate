import { defaultHeader } from "@/config/header";

const mixin = {
  computed: {
    defaultTitle() {
      return defaultHeader.title;
    },
  },
};

export default mixin;
