<template>
  <section class="section">
    <div class="card block">
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <div class="container content has-text-centered image is-128x128">
              <img class="is-rounded" :src="restprofilephoto" alt="" />
            </div>

            <div class="container content has-text-centered">
              <h3 style="color: #0078c8">
                {{ restaurantname || "restaurantname"}}
              </h3>
            </div>
            <div style="text-align:center;margin-top:1rem;">
              <div class="p-font">
                {{ streetaddress || "streetaddress"}}
              </div>
              <div class="p-font" style="margin-top:-0.8rem;">
                {{ city || "city"}},
                {{ state || "state"}}
                {{ zip || "zip"}}
              </div>
              <p class="p-font">
                {{ phonenumber }}
              </p>
            </div>
          </div>
        </div>
        <div class="media">
          <div class="media-content">
            <div style="text-align:center;">
              <h2>
                <router-link :to="'/admin/restaurants/' + restaurantid + '/orders'">
                  {{ $tc('admin.incompleteOrders', numberOfOrders, {count:numberOfOrders}) }}
                </router-link>
              </h2>
            </div>
          </div>
        </div>
        <div class="media">
          <div class="media-content">
            <div style="text-align:center;">
              <h2>
                <router-link :to="'/admin/restaurants/' + restaurantid + '/menus'">
                  {{ $t('admin.editMenuItems', {count:numberOfMenus})}}
                </router-link>
              </h2>
            </div>
          </div>
        </div>
        <div class="media">
          <div class="media-content">
            <div style="text-align:center;">
              <h2>
                <router-link :to="'/admin/restaurants/' + restaurantid">
                  {{$t('admin.editAbout')}}
                </router-link>
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <a href="#" class="card-footer-item">
          <b-icon icon="arrow-up" size="is-midium"></b-icon>
        </a>
        <a href="#" class="card-footer-item">
          <b-icon icon="arrow-down" size="is-midium"></b-icon>
        </a>
        <a href="#" class="card-footer-item">
          <b-icon icon="plus" size="is-midium"></b-icon>
        </a>
        <a href="#" class="card-footer-item">
          <b-icon icon="delete" size="is-midium"></b-icon>
        </a>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "RestaurantEditCard",
  props: {
    restaurantid: {
      type: String,
      required: true
    },
    restprofilephoto: {
      type: String,
      required: true
    },
    restaurantname: {
      type: String,
      required: true
    },
    streetaddress: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zip: {
      type: String,
      required: true
    },
    phonenumber: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: false,
      default: ""
    },
    tags: {
      type: Array,
      required: false,
      default: null
    },
    uid: {
      type: String,
      required: false,
      default: ""
    },
    defaulttaxrate: {
      type: Number,
      required: false,
      default: 0
    },
    publicflag: {
      type: Boolean,
      required: true
    },
    createdat: {
      type: Object,
      required: true
    },
    numberOfMenus: {
      type: Number,
      required: true
    },
    numberOfOrders: {
      type: Number,
      required: true
    },
  },
  methods: {
  }
};
</script>
<style type="scss" scped></style>
