<template>
<section class="section">
  <back-button url="/admin/restaurants/" />

  <template v-if="notFound">
    <not-found />
  </template>
  <template v-else-if="!notFound">
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
    <table>
      <tr>
        <td v-if="shopInfo.restProfilePhoto">
          Current
        </td>
        <td>
          New
        </td>
      </tr>
      <tr>
        <td v-if="shopInfo.restProfilePhoto">
          <img class="card_image" :src="this.shopInfo.restProfilePhoto" />
        </td>
        <td>
          <croppa
            v-model="restProfileCroppa"
            :prevent-white-space="true"
            :zoom-speed="5"
            :width="200"
            :height="200"
            placeholder="No image"
            :placeholder-font-size="20"
            initial-position="center"
            :canvas-color="'gainsboro'"
            ></croppa>
        </td>
      </tr>
    </table>
    <div class="field is-horizontal">
      <div class="field-body">
        <h4>Restaurant cover photo</h4>
      </div>
    </div>
    <table>
      <tr>
        <td v-if="shopInfo.restProfilePhoto">
          Current
        </td>
        <td>
          New
        </td>
      </tr>
      <tr>
        <td v-if="shopInfo.restProfilePhoto">
          <img class="card_cover_image" :src="this.shopInfo.restCoverPhoto" if this.shopInfo.restCoverPhoto />
        </td>
        <td>
          <croppa
            v-model="restCoverCroppa"
            :prevent-white-space="true"
            :zoom-speed="5"
            :width="300"
            :height="150"
            :placeholder="'No image'"
            :placeholder-font-size="20"
            initial-position="center"
            :canvas-color="'gainsboro'"
            ></croppa>
        </td>
      </tr>
    </table>
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
    <b-field
      :type="errors['restaurantName'].length > 0 ? 'is-danger' : 'is-success'"
      >
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
    <b-field type="is-white"
             :type="errors['streetAddress'].length > 0 ? 'is-danger' : 'is-success'"
             >
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
        <b-field
          :type="errors['city'].length > 0 ? 'is-danger' : 'is-white'"
          >
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
        <b-field type="is-white"
                 :type="errors['state'].length > 0 ? 'is-danger' : 'is-success'"
                 >
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
    <b-field
      :type="errors['zip'].length > 0 ? 'is-danger' : 'is-white'"
      >
      <b-input
        v-model="shopInfo.zip"
        type="text"
        placeholder="Enter zip"
        maxlength="10"
        ></b-input>
    </b-field>
    <b-field>
      <b-button variant="outline-primary"
                style="margin-right:auto"
                type="is-primary"
                class="counter-button"
                rounded
                @click="updateMap"
                >
        {{$t("editRestaurant.updateMap")}}
      </b-button>
    </b-field>
    <b-field type="is-white">
      <GMap
        ref="gMap"
        :center="{lat: 44.933076, lng: 15.629058}"
        :options="{fullscreenControl: false}"
        :zoom="18"
        @loaded="hello"
        >
      </GMap>
    </b-field>
    <b-field>
      <b-button variant="outline-primary"
                style="margin-right:auto"
                type="is-primary"
                class="counter-button"
                rounded
                @click="setLocation"
                >
        {{$t("editRestaurant.setLocation")}}
      </b-button>
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
    <b-field
      :type="errors['phoneNumber'].length > 0 ? 'is-danger' : 'is-white'"
      >
      <b-input
        v-model="shopInfo.phoneNumber"
        placeholder="Enter phone number"
        type="tel"
        maxlength="20"
        ></b-input>
    </b-field>

    <b-field label="Website">
      <b-input
        v-model="shopInfo.url"
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
        v-model="shopInfo.tag"
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
                :type="errors['foodTax'].length > 0 ? 'is-danger' : 'is-success'"
                >
                <div style="display:inline-flex">
                  <b-input
                    v-model="shopInfo.foodTax"
                    placeholder="8.2"
                    type="text"
                    maxlength="5"
                    />
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
                :type="errors['alcoholTax'].length > 0 ? 'is-danger' : 'is-success'"
                >
                <div style="display:inline-flex">
                  <b-input
                    v-model="shopInfo.alcoholTax"
                    placeholder="10.2"
                    type="text"
                    maxlength="5"
                    />
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

    <h4>{{$t('shopInfo.hours')}}</h4>
    <p class="p-font bold" style="color:#CB4B4B">
      {{$t('shopInfo.businessHourDescription')}}
    </p>
    <div v-for="(day, index) in days" :key="index">
      <div class="field">
        <b-checkbox v-model="shopInfo.businessDay[index]">
          {{$t("week.short." + day)}}
        </b-checkbox>
      </div>
      <hours-input
        v-model="shopInfo.openTimes[index][0]"
        :type="errors['time'][index][0].length > 0 ? 'is-danger' : 'is-success'"
        :disabled="!shopInfo.businessDay[index]"></hours-input>
      <hours-input
        v-model="shopInfo.openTimes[index][1]"
        :type="errors['time'][index][1].length > 0 ? 'is-danger' : 'is-success'"
        :disabled="!shopInfo.businessDay[index]"></hours-input>
    </div>

    <h4>
      <b-checkbox v-model="shopInfo.publicFlag" :disabled="hasError">
        {{$t('shopInfo.public')}}
      </b-checkbox>
    </h4>

    <b-button
      style="margin-right:auto"
      type="is-primary"
      class="counter-button"
      expanded
      rounded
      @click="submitRestaurant"
    >
      Save
    </b-button>
  </template>
</section>
</template>

<script>
import Vue from "vue";
import { db, storage } from "~/plugins/firebase.js";
import Croppa from "vue-croppa";
import VueTagsInput from "@johmun/vue-tags-input";
import HoursInput from "~/components/HoursInput";

import * as API from "~/plugins/api"
import BackButton from "~/components/BackButton";
import NotFound from "~/components/NotFound";

import { daysOfWeek, USStates } from "~/plugins/constant.js";

Vue.use(Croppa);


export default {
  name: "Order",
  components: {
    HoursInput,
    VueTagsInput,
    BackButton,
    NotFound
  },

  data() {
    const uid = this.$store.getters.uidAdmin;
    return {
      disabled: false, // ??
      filteredItems: [], // ??
      tags: [], // ???
      restProfileCroppa: null,
      restCoverCroppa: null,
      test: null,
      shopInfo: {
        restaurantName: "",
        streetAddress: "",
        city: "",
        state: "",
        zip: "",
        location: {},
        place_id: null,
        phoneNumber: "",
        url: "",
        foodTax: 0,
        alcoholTax: 0,
        tags: ["Meet"],
        tag: "",
        openTimes: {
          1: [], // mon
          2: [],
          3: [],
          4: [],
          5: [],
          6: [],
          7: []
        },
        businessDay: {
          1: true, // mon
          2: true,
          3: true,
          4: true,
          5: true,
          6: true,
          7: true
        },
        publicFlag: false,
      },
      states: USStates,
      maplocation: {},
      place_id: null,
      markers: [],
      days: daysOfWeek,
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
      notFound: null,
    };
  },
  created() {
    this.checkAdminPermission();
  },
  async created() {
    // never use onSnapshot here.
    const restaurant = await db.doc(`restaurants/${this.restaurantId()}`).get();

    if (!restaurant.exists) {
      this.notFound = true;
      return;
    }
    const restaurant_data = restaurant.data();
    this.shopInfo = Object.assign({}, this.shopInfo, restaurant_data);
    this.notFound = false;
  },
  mounted() {
    this.hello();
  },
  computed: {
    errors() {
      const err = {};
      ['restaurantName', 'streetAddress', 'city', 'state', 'zip', 'phoneNumber'].forEach((name) => {
        err[name] = [];
        if (this.shopInfo[name] === "") {
          err[name].push('validationError.'+ name +'.empty');
        }
      });
      ['foodTax', 'alcoholTax'].forEach((name) => {
        err[name] = [];
        if (this.shopInfo[name] !== "") {
          if (isNaN(this.shopInfo[name])) {
            err[name].push('validationError.'+ name +'.invalidNumber');
          }
        }
      });

      err['time'] = {};
      Object.keys(daysOfWeek).forEach((key) => {

        err['time'][key] = [];
        [0, 1].forEach((key2) => {
          err['time'][key].push([]);
          if (this.shopInfo.businessDay[key]) {
            if (this.shopInfo.openTimes[key] && this.shopInfo.openTimes[key][key2]) {
              const data = this.shopInfo.openTimes[key][key2];
              if (this.isNull(data.start) ^ this.isNull(data.end)) {
                err['time'][key][key2].push('validationError.oneInEmpty');
              }
              if (!this.isNull(data.start) && !this.isNull(data.end)) {
                if (data.start > data.end) {
                  err['time'][key][key2].push('validationError.validBusinessTime');
                }
              }
            } else {
              if (key2 === 0) {
                err['time'][key][key2].push('validationError.noSelect');
              }
            }
          }
        });
      });
      // todo more validate
      return err;
    },
    hasError() {
      const num = this.countObj(this.errors);
      return num > 0;
    },
  },
  watch: {
    notFound: function() {
      if (this.notFound === false) {
        this.hello();
      }
    },
    state: function(val) {
      this.shopInfo.tags.push(val); // ???
    }
  },
  methods: {
    hello() {
      if (this.shopInfo && this.shopInfo.location) {
        this.setCurrentLocation(this.shopInfo.location);
      }
    },
    async submitRestaurant() {
      if (this.hasError) return;

      const restaurantId = this.restaurantId();
      if ( this.restProfileCroppa.chosenFile) {
        let restProfileFile = await this.restProfileCroppa.promisedBlob(
          "image/jpeg",
          0.8
        );
        this.shopInfo.restProfilePhoto = await this.uploadFile(
          restProfileFile,
          "profile",
          restaurantId
        );
      }

      if (this.restCoverCroppa.chosenFile) {
        let restCoverFile = await this.restCoverCroppa.promisedBlob(
          "image/jpeg",
          0.8
        );
        this.shopInfo.restCoverPhoto = await this.uploadFile(
          restCoverFile,
          "cover",
          restaurantId
        );
      }
      const restaurantData = {
        restProfilePhoto: this.shopInfo.restProfilePhoto,
        restCoverPhoto: this.shopInfo.restCoverPhoto,
        restaurantName: this.shopInfo.restaurantName,
        streetAddress: this.shopInfo.streetAddress,
        city: this.shopInfo.city,
        state: this.shopInfo.state,
        zip: this.shopInfo.zip,
        location: this.shopInfo.location,
        place_id: this.shopInfo.place_id,
        phoneNumber: this.shopInfo.phoneNumber,
        url: this.shopInfo.url,
        tags: this.shopInfo.tags,
        foodTax: Number(this.shopInfo.foodTax),
        alcoholTax: Number(this.shopInfo.alcoholTax),
        openTimes: this.shopInfo.openTimes,
        businessDay: this.shopInfo.businessDay,
        uid: this.shopInfo.uid,
        defauleTaxRate: 0.1,
        publicFlag: this.shopInfo.publicFlag,
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
    async updateMap() {
      // https://gitlab.com/broj42/nuxt-gmaps#readme
      // https://codesandbox.io/s/6j6zw48l83
      const keyword = [
        this.shopInfo.restaurantName,
        this.shopInfo.streetAddress,
        this.shopInfo.city,
        this.shopInfo.state
      ].join(",");

      const res = await API.google_geocode(keyword);
      if (res && res[0] && res[0].geometry) {
        this.setCurrentLocation(res[0].geometry.location);
        this.place_id = res[0].place_id;
      }
    },
    setCurrentLocation(location) {
      if (this.$refs.gMap && this.$refs.gMap.map &&
          location && location.lat && location.lng) {
        this.$refs.gMap.map.setCenter(location);
        this.removeAllMarker();
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.lat, location.lng),
          title: "hello",
          map: this.$refs.gMap.map,
        });
        this.markers.push(marker);
        this.maplocation = location;
      }
    },
    setLocation() {
      if (this.maplocation) {
        this.shopInfo.location = this.maplocation;
        this.shopInfo.place_id = this.place_id;
      }
    },
    removeAllMarker() {
      if (this.markers && this.markers.length > 0) {
        this.markers.map((marker) => {
          marker.setMap(null);
        });
        this.markers = [];
      }
    },
    async updateRestaurantData(restaurantData) {
      const cleanData = this.cleanObject(restaurantData);
      await db.doc(`restaurants/${this.restaurantId()}`).update(cleanData)
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
.card_image {
    height: 200px;
}
.card_cover_image {
    height: 150px;
}
/deep/.ti-input {
  border-radius: 0.4rem !important;
}
</style>
