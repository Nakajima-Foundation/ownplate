<template>
  <section class="section">
    <h2 class="p-big bold">
      About
    </h2>
    <div class="media">
      <div class="media-content"></div>
      <div class="media-right">
        <p class="p-font bold" style="color:#CB4B4B">
          * Required
        </p>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Restaurant profile photo
          <span class="p-font bold" style="color:#CB4B4B">
            *
          </span>
        </h4>
      </div>
    </div>
    <croppa
      v-model="restProfileCroppa"
      :prevent-white-space="true"
      :zoom-speed="5"
      :width="200"
      :height="200"
      :placeholder="'No image'"
      :placeholder-font-size="20"
      initial-position="center"
      :canvas-color="'gainsboro'"
    ></croppa>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>Restaurant cover photo</h4>
      </div>
    </div>
    <croppa
      v-model="restCoverCroppa"
      :prevent-white-space="true"
      :zoom-speed="5"
      :width="300"
      :height="150"
      :placeholder="'No image'"
      :placeholder-font-size="20"
      :initial-position="center"
      :canvas-color="'gainsboro'"
    ></croppa>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Restaurant name
          <span class="p-font bold" style="color:#CB4B4B">
            *
          </span>
        </h4>
      </div>
    </div>
    <b-field>
      <b-input
        v-model="shopInfo.restaurantName"
        type="text"
        placeholder="Enter restaurant name"
        maxlength="50"
      ></b-input>
    </b-field>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Street address
          <span class="p-font bold" style="color:#CB4B4B">
            *
          </span>
        </h4>
      </div>
    </div>
    <b-field type="is-white">
      <b-input
        v-model="shopInfo.streetAddress"
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
              <span class="p-font bold" style="color:#CB4B4B">
                *
              </span>
            </h4>
          </div>
        </div>
        <b-field type="is-white">
          <b-input
            v-model="shopInfo.city"
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
              <span class="p-font bold" style="color:#CB4B4B">
                *
              </span>
            </h4>
          </div>
        </div>
        <b-field type="is-white">
          <b-select v-model="shopInfo.state" placeholder="select">
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
          <span class="p-font bold" style="color:#CB4B4B">
            *
          </span>
        </h4>
      </div>
    </div>
    <b-field>
      <b-input
        v-model="zip"
        type="text"
        placeholder="Enter zip"
        maxlength="10"
      ></b-input>
    </b-field>

    <b-field type="is-white">
      <GMap
        ref="gMap"
        :cluster="{options: {styles: clusterStyle}}"
        :center="{lat: 44.933076, lng: 15.629058}"
        :options="{fullscreenControl: false, styles: mapStyle}"
        :zoom="6"
        >
        <GMapMarker
          v-for="location in locations"
          :key="location.id"
          :position="{lat: location.lat, lng: location.lng}"
          :options="{icon: location === currentLocation ? pins.selected : pins.notSelected}"
          @click="currentLocation = location"
          >
          <GMapInfoWindow>
            <code>
              lat: {{ location.lat }},
              lng: {{ location.lng }}
            </code>
          </GMapInfoWindow>
        </GMapMarker>
      </GMap>
    </b-field>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Phone number
          <span class="p-font bold" style="color:#CB4B4B">
            *
          </span>
        </h4>
      </div>
    </div>
    <b-field type="is-white">
      <b-input
        v-model="phoneNumber"
        placeholder="Enter phone number"
        type="tel"
        maxlength="20"
      ></b-input>
    </b-field>

    <b-field label="Website">
      <b-input
        v-model="url"
        placeholder="Enter website URL"
        type="url"
        maxlength="100"
      ></b-input>
    </b-field>

    <b-field
      label="Tags"
      type="is-white"
      style="border-radius: 0.4rem!important;"
    >
      <vue-tags-input
        v-model="tag"
        style="border-radius: 0.4rem!important;"
        placeholder="your restaurant tag"
        :tags="tags"
        :validation="validation"
        :autocomplete-items="filteredItems"
        @tags-changed="newTags => (tags = newTags)"
      />
    </b-field>

    <div class="columns">
      <div class="column">
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="field has-addons">
              <b-field
                label="Food tax"
                type="is-white"
                style="border-radius: 0.4rem!important;"
              >
                <div style="display:inline-flex">
                  <b-select v-model="foodTax" :disabled="disabled">
                    <option v-for="taxItem of taxList" :key="taxItem">
                      {{ taxItem }}
                    </option>
                  </b-select>
                  <span
                    style="margin-top: auto;margin-bottom: auto;margin-left:0.4rem;margin-right:0.4rem;"
                  >
                    %
                  </span>
                </div>
              </b-field>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="field has-addons">
              <b-field
                label="Alcohol tax"
                type="is-white"
                style="border-radius: 0.4rem!important;"
              >
                <div style="display:inline-flex">
                  <b-select v-model="alcoholTax" :disabled="disabled">
                    <option v-for="taxItem of taxList" :key="taxItem">
                      {{ taxItem }}
                    </option>
                  </b-select>
                  <span
                    style="margin-top: auto;margin-bottom: auto;margin-left:0.4rem;margin-right:0.4rem;"
                  >
                    %
                  </span>
                </div>
              </b-field>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import Vue from "vue";
import { db, storage } from "~/plugins/firebase.js";
import Croppa from "vue-croppa";
import VueTagsInput from "@johmun/vue-tags-input";
import HoursInput from "~/components/HoursInput";

Vue.use(Croppa);

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

const TAX_RATES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export default {
  name: "Order",
  components: {
    HoursInput,
    VueTagsInput
  },
  data() {
    const uid = this.adminUid();
    return {

      restProfileCroppa: null,
      restCoverCroppa: null,
      shopInfo: {
        restaurantName: "",
        streetAddress: "",
        city: "",
        state: "",
        zip: "",
        phoneNumber: "",
        url: "",
        foodTax: 0,
        alcoholTax: 0,
        states: US_STATES,
        taxList: TAX_RATES,
        tags: ["Meet"],
      },
      hoursMon: true,
      hoursTue: true,
      hoursWed: true,
      hoursThu: true,
      hoursFri: true,
      hoursSat: true,
      hoursSun: true,
      tag: "",
      autocompleteItems: [
        {
          text: 'Invalid because of "8"'
        }
      ],
      validation: [
        {
          classes: "no-braces",
          disableAdd: true,
          rule: tag => tag.text.length > 15
        }
      ],
    };
  },
  beforeCreated() {
    this.checkAdminPermission();
  },
  async created() {
    // never use onSnapshot here.
    const restaurant = await db.doc(`restaurants/${this.restaurantId()}`).get();

    if (restaurant.exists) {
      const restaurant_data = restaurant.data();
      this.shopInfo = Object.assign({}, this.shopInfo, restaurant_data);
      console.log(this.shopInfo);
      // todo update data.
    } else {
      // todo something error
    }
  },
  computed: {
    formIsValid() {
      return true;
      return (
        this.restProfileCroppa !== "" &&
        this.shopInfo.restaurantName !== "" &&
        this.shopInfo.streetAddress !== "" &&
        this.shopInfo.city !== "" &&
        this.zip !== "" &&
        this.phoneNumber !== "" &&
        this.shopInfo.state !== ""
      );
    }
  },
  watch: {
    state: function(val) {
      this.tags.push(val);
    }
  },
  methods: {
    async submitRestaurant() {
      if (!this.formIsValid) return;

      const restaurantId = this.restaurantId();
      let restProfileFile = await this.restProfileCroppa.promisedBlob(
        "image/jpeg",
        0.8
      );
      let restProfilePhoto = await this.uploadFile(
        restProfileFile,
        "profile",
        restaurantId
      );
      let restCoverFile = await this.restCoverCroppa.promisedBlob(
        "image/jpeg",
        0.8
      );
      let restCoverPhoto = await this.uploadFile(
        restCoverFile,
        "cover",
        restaurantId
      );
      const restaurantData = {
        restaurantName: this.shopInfo.restaurantName,
        streetAddress: this.shopInfo.streetAddress,
        city: this.shopInfo.city,
        state: this.shopInfo.state,
        zip: this.shopInfo.zip,
        phoneNumber: this.shopInfo.phoneNumber,
        url: this.shopInfo.url,
        tags: this.shopInfo.tags,
        foodTax: Number(this.shopInfo.foodTax),
        alcoholTax: Number(this.shopInfo.alcoholTax),
        uid: this.shopInfo.uid,
        defauleTaxRate: 0.1,
        publicFlag: true,
        createdAt: new Date()
      };
      await this.updateRestaurantData(restaurantData);

      this.$router.push({
        path: `/admin/restaurants/`
      });
    },
    uploadFile(file, filename, restaurantId) {
      return new Promise((resolve, rejected) => {
        let storageRef = storage.ref();
        let mountainsRef = storageRef.child(
          `/images/restaurants/${restaurantId}/${filename}.jpg`
        );
        let uploadTask = mountainsRef.put(file);

        uploadTask.on(
          "state_changed",
          snapshot => {},
          err => {
            this.loading = false;
          },
          () =>
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadURL => resolve(downloadURL))
        );
      });
    },
    updateRestaurantData(restaurantData) {
      return new Promise((resolve, rejected) => {
        db.doc(`restaurants/${this.restaurantId()}`)
          .set(restaurantData)
          .then(() => {
            console.log("OK");
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
/deep/.ti-input {
  border-radius: 0.4rem !important;
}
</style>
