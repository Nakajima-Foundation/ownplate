import Vue from 'vue';

export default ({app}) => {
  Vue.mixin({
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
        if (!(this.$store.getters.uidAdmin)) {
          const redirectUrl = encodeURIComponent(this.$route.path);
          if (redirectUrl) {
            this.$router.replace('/admin/user/signin?to=' + redirectUrl);
          } else {
            this.$router.replace('/admin/user/signin');
          }
          return false;
        }
        return true;
      },
      checkUserPermission() {
        if (!(this.$store.getters.uidUser)) {
          this.$router.replace('/admin/user/signin');
          return false;
        }
        return true;
      },
    },
    computed: {
      isUser() {
        return !!this.$store.getters.uidUser;
      },
      isLiffUser() {
        return (this.mode === "liff") && this.$store.state.claims.liffId;
      },
      isNotSuperAdmin() {
        return this.$store.getters.isNotSuperAdmin;
      },
      isNotOperator() {
        return this.$store.getters.isNotOperator;
      }
    },
  });
}
