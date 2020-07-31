import Vue from 'vue';

export default ({app}) => {
  Vue.mixin({
    methods: {
      checkAdminPermission() {
        if (!(this.$store.getters.uidAdmin)) {
          this.$router.replace('/admin/user/signin');
        }
      },
      checkUserPermission() {
        if (!(this.$store.getters.uidUser)) {
          this.$router.replace('/admin/user/signin');
        }
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
      }
    },
  });
}
