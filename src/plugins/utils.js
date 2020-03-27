import Vue from 'vue';

export default ({app}) => {
  Vue.mixin({
    methods: {
      restaurantId() {
        return this.$route.params.restaurantId;
      },
      orderId() {
        return this.$route.params.orderId;
      },
      adminUid() {
        return this.$store.getters["admin/user"].uid;
      },

    }
  });
}
