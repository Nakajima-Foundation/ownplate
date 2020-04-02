import Vue from 'vue';

export default ({app}) => {
  Vue.mixin({
    methods: {
      restaurantId() {
        return this.$route.params.restaurantId;
      },
      adminUid() {
        return this.$store.getters["admin/user"].uid;
      },
      doc2data(dataType) {
        return (doc) => {
          const data = doc.data();
          data.id = doc.id;
          data._dataType = dataType;
          return data;
        };
      },
      array2obj(array) {
        return array.reduce((tmp, current) => {
          tmp[current.id] = current;
          return tmp;
        }, {});
      },
    }
  });
}
