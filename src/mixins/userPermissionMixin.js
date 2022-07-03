import Vue from "vue";

const mixin = {
  methods: {
    redirectToAdminPage() {
      const redirect = this.$route.query["to"];
      const pathRegex = /^\/[a-zA-Z0-9-\_\/]+$/;

      if (redirect && pathRegex.test(redirect)) {
        this.$router.push(redirect);
      } else {
        this.$router.push("/admin/restaurants");
      }
    },
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
    checkUserPermission() {
      if (!this.$store.getters.uidUser) {
        this.$router.replace("/admin/user/signin");
        return false;
      }
      return true;
    },
    // subaccount ok.
    checkShopAccount(shopInfo) {
      return shopInfo.uid === this.ownerUid;
    },
    // just owner. don't allow subaccount.
    checkShopOwner(shopInfo) {
      return shopInfo.uid === this.uidAdmin;
    },
  },
  computed: {
    uidAdmin() {
      return this.$store.getters.uidAdmin;
    },
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
