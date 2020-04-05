import Vue from 'vue';

export default ({app}) => {
  Vue.mixin({
    methods: {
      checkAdminPermission() {
        console.log(this.$store.state.user);
        if (!(this.$store.state.user && this.$store.state.user.email)) {
          this.$router.push('/admin/user/signin');
        }
      }
    },
  });
}
