import Vue from 'vue';

export default ({app}) => {
  Vue.mixin({
    methods: {
      checkAdminPermission() {
        if (this.$store.state.user === undefined) {
          // Authentication incomplete. Ignore it for now. 
          return;
        }
        if (!(this.$store.getters.uidAdmin)) {
          this.$router.push('/admin/user/signin');
        }
      }
    },
  });
}
