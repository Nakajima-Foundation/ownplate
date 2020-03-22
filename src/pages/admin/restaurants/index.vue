<template>
  <section class="section">
    <h2 class="p-big bold">
      Your Restaurant
    </h2>
    <div>No restaurant</div>
    <shop-orner-info
      :src="
        'https://pbs.twimg.com/profile_images/704153164438642692/bYo0YeEr_bigger.jpg'
      "
      :name="restaurantName"
    ></shop-orner-info>
    <div style="text-align:center;margin-top:1rem;">
      <p class="p-font">
        {{ streetAddress }}
      </p>
      <p class="p-font">
        {{ city }}
        {{ state }}
        {{ zip }}
      </p>
      <p class="p-font">
        {{ phoneNumber }}
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

    <a href="/admin/restaurants/new">
      <b-button
        style="margin-right:auto"
        type="is-info"
        class="counter-button"
        expanded
        rounded
      >
        Add new restaurant
      </b-button>
    </a>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import ShopOrnerInfo from "~/components/ShopOrnerInfo";

export default {
  name: "Restaurant",
  components: {
    ShopOrnerInfo
  },
  data() {
    return {
      restProfilePhoto: null,
      restProfilePhotoImageUrl: "",
      restCoverPhoto: null,
      restCoverPhotoImageUrl: "",
      restaurantName: "",
      streetAddress: "",
      city: "",
      state: "",
      zip: "",
      phoneNumber: "",
      url: "",
      tags: "",
      uid: ""
    };
  },
  computed: {},
  mounted() {
    db.collection("restaurants")
      .doc(this.$route.query.id)
      .get()
      .then(data => {
        (this.restaurantName = data.get("restaurantName")),
          (this.streetAddress = data.get("streetAddress")),
          (this.city = data.get("city")),
          (this.state = data.get("state")),
          (this.zip = data.get("zip")),
          (this.phoneNumber = data.get("phoneNumber")),
          (this.url = data.get("url")),
          (this.tags = data.get("tags")),
          (this.uid = data.get("uid")),
          (this.defaultTaxRate = data.get("defauleTaxRate")),
          (this.publicFlag = data.get("publicFlag"));
      })
      .catch(error => {
        console.log("Error fetch doc,", error);
      });
  },
  methods: {
    editMenu() {
      this.$router.push({
        path: `/admin/restaurants/menus/?id=${this.$route.query.id}`
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
