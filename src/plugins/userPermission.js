import Vue from 'vue';

export default ({app}) => {
  Vue.mixin({
    methods: {
      checkAdminPermission() {
        // console.log(this._routerRoot._route.path);
        console.log("CHECK");
        if (!this.$store.getters['admin/user']) {
          this.$router.push('/admin/user/signin');
        }
      }
    },
  });
}
