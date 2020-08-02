export default {
  computed: {
    isSuperPage() {
      return location.pathname.startsWith("/s/")
    },
    backUrl() {
      return this.isSuperPage ? "/s" : "/o";
    },
  },
  methods: {
    superPermissionCheck() {
      if (this.isSuperPage) {
        if (!this.$store.state.user || this.$store.getters.isNotSuperAdmin) {
          this.$router.push("/");
        }
      } else {
        if (!this.$store.state.user || (this.$store.getters.isNotSuperAdmin && this.$store.getters.isNotOperator)) {
          this.$router.push("/");
        }
      }
    },
  }
};
