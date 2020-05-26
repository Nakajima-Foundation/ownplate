import Vue from 'vue';

export default ({app}) => {
  Vue.mixin({
    methods: {
      checkAdminPermission() {
        if (!(this.$store.getters.uidAdmin)) {
          this.$router.replace('/admin/user/signin');
        }
      }
    },
  });
}
