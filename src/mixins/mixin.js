import { defaultHeader } from "@/config/header";

const mixin = {
  methods: {
    resizedProfileImage(restaurant, size) {
      return (
        (restaurant?.images?.profile?.resizedImages || {})[size] ||
        restaurant?.restProfilePhoto
      );
    },
  },
  computed: {
    defaultTitle() {
      return defaultHeader.title;
    },
  },
};

export default mixin;
