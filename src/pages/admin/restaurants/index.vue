<template>
  <section class="section">
    <h2 class="p-big bold">
      Your Restaurant
    </h2>

    <div v-for="restaurantItem in restaurantItems" :key="restaurantItem.id">
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
      restaurantItems: []
    };
  },
  beforeCreated() {
    this.checkAdminPermission();
  },
  computed: {},
  async mounted() {
    const uid = this.$store.getters['admin/user'].uid;
    const res = await db.collection("restaurants")
          .where("uid", "==", uid)
          .get();
    try {
      this.restaurantItems = (res.docs||[]).map((doc) => {
        let restaurantId = doc.id;
        const data = doc.data();
        data.restaurantId =  doc.id
        return data;
      });
    } catch(error) {
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
