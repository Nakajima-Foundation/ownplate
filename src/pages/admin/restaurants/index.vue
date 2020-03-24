<template>
  <section class="section">
    <h2 class="p-big bold">
      Your Restaurant
    </h2>

    <b-tabs size="is-medium" class="block" expanded>
      <b-tab-item label="Restaurant">
        <div class="card block">
          <div class="card-content">
            <div
              v-if="!existsRestaurant"
              class="container content has-text-centered"
            >
              <b-icon icon="silverware" size="is-large"></b-icon>
              <h3>No restaurant</h3>
              Please add your restaurant from the bottom button.
            </div>
          </div>
          <div v-if="existsRestaurant">
            <div
              v-for="restaurantItem in restaurantItems"
              :key="restaurantItem.id"
            >
              <restaurant-edit-card
                :restprofilephoto="restaurantItem.restProfilePhoto"
                :restaurantid="restaurantItem.restaurantId"
                :restaurantname="restaurantItem.restaurantName"
                :streetaddress="restaurantItem.streetAddress"
                :city="restaurantItem.city"
                :state="restaurantItem.state"
                :zip="restaurantItem.zip"
                :phonenumber="restaurantItem.phoneNumber"
                :url="restaurantItem.url"
                :tags="restaurantItem.tags"
                :uid="restaurantItem.uid"
                :defaulttaxrate="restaurantItem.defauleTaxRate"
                :publicflag="restaurantItem.publicFlag"
                :createdat="restaurantItem.createdAt"
                @emitting="emitted($event)"
              ></restaurant-edit-card>
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
        </div>
      </b-tab-item>
      <b-tab-item label="Payment">
        <div class="card block">
          <div class="card-content">
            <div
              v-if="!existsPayment"
              class="container content has-text-centered"
            >
              <b-icon icon="credit-card" size="is-large"></b-icon>
              <h3>No Payment account</h3>
              Please connect your payment account from the bottom button.
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
            Connect payment account
          </b-button>
        </a>
      </b-tab-item>
    </b-tabs>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import RestaurantEditCard from "~/components/RestaurantEditCard";

export default {
  name: "Restaurant",
  components: {
    RestaurantEditCard
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
      uid: "",
      restaurantItems: [],
      paymentItems: []
    };
  },
  beforeCreated() {
    this.checkAdminPermission();
  },
  computed: {
    existsRestaurant() {
      if (this.restaurantItems.length > 0) {
        return true;
      }
      return false;
    },
    existPayment() {
      if (this.paymentItems.length > 0) {
        return true;
      }
      return false;
    }
  },
  async mounted() {
    const uid = this.$store.getters["admin/user"].uid;
    const res = await db
      .collection("restaurants")
      .where("uid", "==", uid)
      .get();
    try {
      this.restaurantItems = (res.docs || []).map(doc => {
        let restaurantId = doc.id;
        const data = doc.data();
        data.restaurantId = doc.id;
        return data;
      });
    } catch (error) {
      console.log("Error fetch doc,", error);
    }
  },
  methods: {
    emitted(eventArgs) {
      if (eventArgs.restaurantid) {
        this.$router.push({
          path: `/admin/restaurants/${eventArgs.restaurantid}/menus/`
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
