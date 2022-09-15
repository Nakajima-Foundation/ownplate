import Vue from "vue";

const mixin = {
  methods: {
    checkAdminPermission() {
      if (!this.$store.getters.uidAdmin) {
        const redirectUrl = encodeURIComponent(this.$route.path);
        if (redirectUrl) {
          this.$router.replace("/admin/user/signin?to=" + redirectUrl);
        } else {
          this.$router.replace("/admin/user/signin");
        }
        return false;
      }
      return true;
    },
    // subaccount ok.
    checkShopAccount(shopInfo) {
      return shopInfo.uid === this.ownerUid;
    },
  },
  computed: {
    isUser() {
      return !!this.$store.getters.uidUser;
    },
    isNotSuperAdmin() {
      return this.$store.getters.isNotSuperAdmin;
    },
    isNotOperator() {
      return this.$store.getters.isNotOperator;
    },
    ownerUid() {
      return this.$store.getters.isSubAccount
        ? this.$store.getters.parentId
        : this.$store.getters.uidAdmin;
    },
  },
};

export default mixin;
