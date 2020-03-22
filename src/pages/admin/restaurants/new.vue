<template>
  <section class="section">
    <h2 class="p-big bold">
      About
    </h2>
    <div class="media">
      <div class="media-content"></div>
      <div class="media-right">
        <p class="p-small bold" style="color:#CB4B4B">
          * Required
        </p>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Restaurant profile photo
        </h4>
        <p class="p-small" style="color:#CB4B4B">
          *
        </p>
      </div>
    </div>
    <b-field class="file">
      <div class="columns">
        <div class="column is-harf">
          <img :src="restProfilePhotoImageUrl" />
        </div>
        <div class="column is-harf">
          <b-upload v-model="restProfilePhoto" type="is-link">
            <a class="button">
              <span>Add image</span>
            </a>
          </b-upload>
        </div>
      </div>
    </b-field>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>Restaurant cover photo</h4>
      </div>
    </div>
    <b-field class="file">
      <div class="columns">
        <div class="column is-harf">
          <img :src="restCoverPhotoImageUrl" />
        </div>
        <div class="column is-harf">
          <b-upload v-model="restCoverPhoto" type="is-link">
            <a class="button">
              <span>Add image</span>
            </a>
          </b-upload>
        </div>
      </div>
    </b-field>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Restaurant name
        </h4>
        <p class="p-small" style="color:#CB4B4B">
          *
        </p>
      </div>
    </div>
    <b-field>
      <b-input
        v-model="restaurantName"
        placeholder="Enter restaurant name"
      ></b-input>
    </b-field>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Street address
        </h4>
        <p class="p-small" style="color:#CB4B4B">
          *
        </p>
      </div>
    </div>
    <b-field type="is-white">
      <b-input
        v-model="streetAddress"
        type="text"
        placeholder="Enter street address"
        maxlength="30"
      ></b-input>
    </b-field>

    <div class="columns">
      <div class="column">
        <div class="field is-horizontal">
          <div class="field-body">
            <h4>
              City
            </h4>
            <p class="p-small" style="color:#CB4B4B">
              *
            </p>
          </div>
        </div>
        <b-field type="is-white">
          <b-input
            v-model="city"
            type="text"
            placeholder="Enter city"
            maxlength="15"
          ></b-input>
        </b-field>
      </div>
      <div class="column">
        <div class="field is-horizontal">
          <div class="field-body">
            <h4>
              State
            </h4>
            <p class="p-small" style="color:#CB4B4B">
              *
            </p>
          </div>
        </div>
        <b-field type="is-white">
          <b-select v-model="state" placeholder="select">
            <option v-for="stateItem in states" :key="stateItem">
              {{ stateItem }}
            </option>
          </b-select>
        </b-field>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Zip
        </h4>
        <p class="p-small" style="color:#CB4B4B">
          *
        </p>
      </div>
    </div>
    <b-field type="is-white">
      <b-input
        v-model="zip"
        type="text"
        placeholder="Enter zip"
        maxlength="30"
      ></b-input>
    </b-field>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Phone number
        </h4>
        <p class="p-small" style="color:#CB4B4B">
          *
        </p>
      </div>
    </div>
    <b-field type="is-white">
      <b-input
        v-model="phoneNumber"
        placeholder="Enter phone number"
        type="tel"
        maxlength="30"
      ></b-input>
    </b-field>

    <b-field label="Website" type="is-white">
      <b-input
        v-model="url"
        placeholder="Enter website URL"
        type="url"
        maxlength="30"
      ></b-input>
    </b-field>

    <b-field label="Tags" type="is-white">
      <b-input
        v-model="tags"
        placeholder="Enter Tags"
        type="text"
        maxlength="30"
      ></b-input>
    </b-field>

    <h4>Hours</h4>

    <div class="field">
      <b-checkbox v-model="hoursMon">
        Mon
      </b-checkbox>
    </div>
    <hours-input :disabled="!hoursMon"></hours-input>

    <div class="field">
      <b-checkbox v-model="hoursTue">
        Tue
      </b-checkbox>
    </div>
    <hours-input :disabled="!hoursTue"></hours-input>

    <div class="field">
      <b-checkbox v-model="hoursWed">
        Wed
      </b-checkbox>
    </div>
    <hours-input :disabled="!hoursWed"></hours-input>

    <div class="field">
      <b-checkbox v-model="hoursThu">
        Thu
      </b-checkbox>
    </div>
    <hours-input :disabled="!hoursThu"></hours-input>

    <div class="field">
      <b-checkbox v-model="hoursFri">
        Fri
      </b-checkbox>
    </div>
    <hours-input :disabled="!hoursFri"></hours-input>

    <div class="field">
      <b-checkbox v-model="hoursSat">
        Sat
      </b-checkbox>
    </div>
    <hours-input :disabled="!hoursSat"></hours-input>

    <div class="field">
      <b-checkbox v-model="hoursSun">
        Sun
      </b-checkbox>
    </div>
    <hours-input :disabled="!hoursSun"></hours-input>

    <b-button
      :disabled="!formIsValid"
      style="margin-right:auto"
      type="is-info"
      class="counter-button"
      expanded
      rounded
      @click="submitRestaurant"
    >
      Save
    </b-button>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import HoursInput from "~/components/HoursInput";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];

export default {
  name: "Order",
  components: {
    HoursInput
  },
  data() {
    return {
      restProfilePhoto: null,
      restProfilePhotoImageUrl: "/no_image.jpg",
      restCoverPhoto: null,
      restCoverPhotoImageUrl: "/no_image.jpg",
      restaurantName: "",
      streetAddress: "",
      city: "",
      state: "",
      zip: "",
      phoneNumber: "",
      url: "",
      tags: "",
      states: US_STATES,
      uid: "hogehoge", //TODO test
      hoursMon: true,
      hoursTue: true,
      hoursWed: true,
      hoursThu: true,
      hoursFri: true,
      hoursSat: true,
      hoursSun: true
    };
  },
  computed: {
    formIsValid() {
      return (
        this.restProfilePhoto !== "" &&
        this.restaurantName !== "" &&
        this.streetAddress !== "" &&
        this.city !== "" &&
        this.zip !== "" &&
        this.phoneNumber !== "" &&
        this.state !== ""
      );
    }
  },
  watch: {
    restProfilePhoto: function(val) {
      let filename = this.restProfilePhoto.name;
      if (filename.lastIndexOf(".") <= 0) {
        return alert("Please add a valid file!");
      }
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        this.restProfilePhotoImageUrl = fileReader.result;
      });
      fileReader.readAsDataURL(this.restProfilePhoto);
    },
    restCoverPhoto: function(val) {
      let filename = this.restCoverPhoto.name;
      if (filename.lastIndexOf(".") <= 0) {
        return alert("Please add a valid file!");
      }
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        this.restCoverPhotoImageUrl = fileReader.result;
      });
      fileReader.readAsDataURL(this.restCoverPhoto);
    }
  },
  methods: {
    async submitRestaurant() {
      if (!this.formIsValid) return;

      const restaurantData = {
        restaurantName: this.restaurantName,
        streetAddress: this.streetAddress,
        city: this.city,
        state: this.state,
        zip: this.zip,
        phoneNumber: this.phoneNumber,
        url: this.url,
        tags: this.tags,
        uid: this.uid,
        defauleTaxRate: 0.1,
        publicFlag: true
      };
      const restaurantId = this.generateUniqueId();
      await this.createRestaurantData(restaurantId, restaurantData);

      this.$router.push({
        path: `/admin/restaurants/?id=${restaurantId}`
      });
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
            restaurantName: restaurantData.restaurantName,
            streetAddress: restaurantData.streetAddress,
            city: restaurantData.city,
            state: restaurantData.state,
            zip: restaurantData.zip,
            phoneNumber: restaurantData.phoneNumber,
            url: restaurantData.url,
            tags: restaurantData.tags,
            uid: restaurantData.uid,
            defaultTaxRate: restaurantData.defauleTaxRate,
            publicFlag: restaurantData.publicFlag
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
