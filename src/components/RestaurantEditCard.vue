<template>
  <section class="section">
    <shop-orner-info
      :src="
        'https://pbs.twimg.com/profile_images/704153164438642692/bYo0YeEr_bigger.jpg'
      "
      :name="restaurantname"
    ></shop-orner-info>
    <div style="text-align:center;margin-top:1rem;">
      <p class="p-font">
        {{ streetaddress }}
      </p>
      <p class="p-font">
        {{ city }}
        {{ state }}
        {{ zip }}
      </p>
      <p class="p-font">
        {{ phonenumber }}
      </p>
    </div>

    <div class="card block">
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <div style="text-align:center;">
              <h2 class="bold">
                X incomplete orders
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card block">
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <div style="text-align:center;">
              <h2 class="bold" @click="editMenu">
                Edit Menu(X items)
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card block">
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <div style="text-align:center;">
              <h2 class="bold">
                Edit About
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import ShopOrnerInfo from "~/components/ShopOrnerInfo";

export default {
  name: "RestaurantEditCard",
  components: {
    ShopOrnerInfo
  },
  props: {
    restaurantid: {
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
      type: String,
      required: false,
      default: ""
    },
    uid: {
      type: String,
      required: false,
      default: ""
    },
    defaulttaxrate: {
      type: String,
      required: false,
      default: ""
    },
    publicflag: {
      type: Boolean,
      required: true
    },
    createdat: {
      type: String,
      required: true
    }
  },
  methods: {
    editMenu() {
      this.$emit("emitting", { restaurantid: this.restaurantid });
    }
  }
};
</script>
<style type="scss" scped></style>
