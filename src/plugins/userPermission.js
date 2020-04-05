import Vue from 'vue';

export default ({app}) => {
  Vue.mixin({
    methods: {
      checkAdminPermission() {
        if (!this.$store.getters['admin/user']) {
          this.$router.push('/admin/user/signin');
        }
      }
    },
  });
}
