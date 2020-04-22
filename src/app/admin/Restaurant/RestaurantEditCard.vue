<template>
  <section class="section">
    <div class="card block">
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <div class="container content has-text-centered image is-128x128">
              <img class="is-rounded" :src="restprofilephoto||'/OwnPlate-Favicon-Default.png'" alt />
            </div>

            <div class="container content has-text-centered">
              <h2>
                <nuxt-link :to="localePath('/r/' + restaurantid)">{{ restaurantname || "no restaurant name"}}</nuxt-link>
              </h2>
            </div>
            <div style="text-align:center;margin-top:1rem;">
              <div class="p-font">
                <nuxt-link :to="localePath('/r/' + restaurantid)">{{`${host}/r/${restaurantid}`}}</nuxt-link>
              </div>
              <div class="p-font">{{ streetaddress || "no streetaddress"}}</div>
              <div class="p-font" style="margin-top:-0.8rem;">
                {{ city || "city"}},
                {{ state || "state"}}
                {{ zip || "zip"}}
              </div>
              <p class="p-font">{{ phonenumber }}</p>
            </div>
            <div class="container content has-text-centered">
              <div style="text-align:center;">
                <h2>
                  <nuxt-link  to="#" @click.native="copyClipboard()"><b-icon icon="share" size="is-midium"></b-icon>{{$t('admin.shareRestaurant')}}</nuxt-link>
                  <nuxt-link :to="localePath('/admin/restaurants/' + restaurantid)"> <b-icon icon="pencil" size="is-midium"></b-icon>{{$t('admin.editAbout')}}</nuxt-link>
                </h2>
              </div>
            </div>
            <div class="container content has-text-centered" :style="{margin: '20px'}">
              <b-button
                tag="nuxt-link"
                :to="localePath('/admin/restaurants/' + restaurantid + '/orders')"
                :style="{'margin-right': 'auto', height: '40px'}"
                  type="is-primary"
                class="counter-button"
                expanded
                rounded
                  contained
                >
                {{ $tc('admin.incompleteOrders', numberOfOrders, {count:numberOfOrders}) }}
              </b-button>
            </div>
            <div class="container content has-text-centered" :style="{margin: '20px'}">
              <div style="text-align:center;">
                <h2>
                  <b-button
                    tag="nuxt-link"
                    :to="localePath('/admin/restaurants/' + restaurantid + '/menus')"
                    style="margin-right:auto"
                    type="is-primary"
                    class="counter-button"
                    expanded
                    rounded
                    outlined
                    >{{ $t('admin.editMenuItems', {count:numberOfMenus})}}</b-button>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <a class="card-footer-item" @click="deleteRestaurant">
          <b-icon icon="delete" size="is-midium"></b-icon>
        </a>
      </div>
    </div>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";

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
    numberOfMenus: {
      type: Number,
      required: true
    },
    numberOfOrders: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      host: location.protocol + "//" + location.host,
      shareUrl: location.protocol + "//" + location.host + "/r/" + this.restaurantid,
    };

  },
  methods: {
    deleteRestaurant: function() {
      if (confirm("Do you really want to delete this?")) {
        db.doc(`restaurants/${this.restaurantid}`).update("deletedFlag", true);
      }
    },
    copyClipboard: async function() {
      try {
        await this.$copyText(this.shareUrl);
        this.$buefy.toast.open('URL Copied');
      } catch(e) {
        this.$buefy.toast.open('URL Copy failed');
      }
    },
  }
};
</script>
<style type="scss" scped></style>
