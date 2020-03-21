<template>
  <section class="section">
    <h2>Create a new Restaurant</h2>
    <b-field label="ShopName">
      <b-input v-model="name"></b-input>
    </b-field>

    <h4>Banner</h4>
    <b-field class="file">
      <b-upload v-model="bannerFile">
        <a class="button is-primary">
          <b-icon icon="upload"></b-icon>
          <span>Banner</span>
        </a>
      </b-upload>
      <span v-if="bannerFile" class="file-name">
        {{ bannerFile.name }}
      </span>
    </b-field>

    <!-- TODO : show banner image -->

    <b-field label="Address" type="is-white">
      <b-input v-model="address" type="text" maxlength="30"></b-input>
    </b-field>

    <b-field label="Phone Number" type="is-white">
      <b-input v-model="phone" type="tel" maxlength="30"></b-input>
    </b-field>

    <b-field label="Website" type="is-white">
      <b-input v-model="url" type="url" maxlength="30"></b-input>
    </b-field>

    <b-button :disabled="!formIsValid" type="submit" @click="submitRestaurant">
      Create Restaurant
    </b-button>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";

export default {
  name: "Order",
  data() {
    return {
      name: "",
      address: "",
      bannerFile: null,
      phone: "",
      url: "",
      uid: "hogehoge", //TODO test
      bannerImageUrl: "",
      bannerImage: null
    };
  },
  computed: {
    formIsValid() {
      return (
        this.name !== "" &&
        this.address !== "" &&
        this.phone !== "" &&
        this.url !== ""
      );
    }
  },
  methods: {
    async submitRestaurant() {
      if (!this.formIsValid) return;

      const restaurantData = {
        name: this.name,
        address: this.address,
        phone: this.phone,
        url: this.url,
        uid: this.uid,
        defauleTaxRate: 0.1,
        publicFlag: true
      };
      const restaurantId = this.generateUniqueId();
      await this.createRestaurantData(restaurantId, restaurantData);
      // const restaurantsCollection = db.collection("restaurants");
      // restaurantsCollection.add(restaurantData);

      this.$router.push({ path: `/shop/menu/?id=${restaurantId}` });
    },
    generateUniqueId() {
      return (
        new Date().getTime().toString(16) +
        Math.floor(1000000000 * Math.random()).toString(16)
      );
    },
    createRestaurantData(restaurantId, restaurantData) {
      return new Promise((resolve, rejected) => {
        db.collection("restaurants")
          .doc(restaurantId)
          .set({
            name: restaurantData.name,
            address: restaurantData.address,
            phone: restaurantData.phone,
            web_url: restaurantData.url,
            uid: restaurantData.uid,
            default_tax_rate: restaurantData.defauleTaxRate,
            public_flag: restaurantData.publicFlag
          })
          .then(() => {
            resolve();
          })
          .catch(error => {
            console.error("Error writing document: ", error);
            this.loading = false;
          });
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
