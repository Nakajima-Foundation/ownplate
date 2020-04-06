<template>
  <section class="section">
    <b-button
      style="margin-right:auto"
      type="is-primary"
      class="counter-button"
      icon-left="arrow-left"
      rounded
      outlined
      @click="goBack()"
    >
      Back
    </b-button>

    <h2 class="p-big bold">
      Item
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
          Item name
        </h4>
        <p class="p-small" style="color:#CB4B4B">
          *
        </p>
      </div>
    </div>
    <b-field>
      <b-input v-model="itemName" placeholder="Enter item name"></b-input>
    </b-field>

    <div class="columns">
      <div class="column is-6">
        <div class="field is-horizontal">
          <div class="field-body">
            <h4>
              Price
            </h4>
            <p class="p-small" style="color:#CB4B4B">
              *
            </p>
          </div>
        </div>
        <div class="columns">
          <div class="column">
            <b-field>
              <b-input
                v-model="price"
                type="number"
                step="0.01"
                placeholder="00.00"
                max="10000.00"
                min="0.00"
              ></b-input>
            </b-field>
          </div>
          <div class="column">
            <h4>USD</h4>
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="field is-horizontal">
          <div class="field-body">
            <h4>
              Tax
            </h4>
            <p class="p-small" style="color:#CB4B4B">
              *
            </p>
          </div>
        </div>
        <b-field type="is-white">
          <b-select v-model="tax" placeholder="select">
            <option v-for="taxItem in taxRates" :key="taxItem">
              {{ taxItem }}
            </option>
          </b-select>
        </b-field>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Item description
        </h4>
      </div>
    </div>
    <b-field>
      <b-input
        v-model="itemDescription"
        placeholder="Enter item description"
      ></b-input>
    </b-field>

    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          Item photo
        </h4>
      </div>
    </div>
    <croppa
      v-model="croppa"
      :prevent-white-space="true"
      :zoom-speed="5"
      initial-position="center"
      :canvas-color="'gainsboro'"
    ></croppa>

    <h4>
      Availability
    </h4>
    <b-field type="is-white">
      <b-select v-model="availability" placeholder="select">
        <option v-for="availItem in availOptions" :key="availItem">
          {{ availItem }}
        </option>
      </b-select>
    </b-field>

    <b-button
      :disabled="!formIsValid"
      style="margin-right:auto"
      type="is-primary"
      class="counter-button"
      expanded
      rounded
      @click="submitItem"
    >
      Save
    </b-button>
  </section>
</template>

<script>
import Vue from "vue";
import { db, storage } from "~/plugins/firebase.js";
import Croppa from "vue-croppa";

Vue.use(Croppa);

const TAX_RATES = [
  "5%",
  "6%",
  "7%",
  "8%",
  "9%",
  "10%",
  "11%",
  "12%",
  "13%",
  "14%",
  "15%"
];

const AVAIL_OPTIONS = ["All day"];

export default {
  name: "Order",
  data() {
    return {
      itemName: "",
      price: "",
      tax: "",
      itemDescription: "",
      taxRates: TAX_RATES,
      availability: "",
      availOptions: AVAIL_OPTIONS,
      croppa: {},
      restaurantInfo: {},
    };
  },
  created() {
    this.checkAdminPermission();
  },
  async created() {
    const restaurantRef =  db.doc(`restaurants/${this.restaurantId()}`);
    const resRestInfo = await restaurantRef.get();
    if (resRestInfo.exists) {
      this.restaurantInfo = resRestInfo.data();
      // check restaurantInfo owner
      if (this.restaurantInfo.uid !== this.uid) {
        // something error
      }
    } else {
      console.log("Error fetch restaurantInfo.");
    }
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
    formIsValid() {
      return this.itemName !== "" && this.price !== "" && this.tax !== "";
    }
  },
  methods: {
    async submitItem() {
      if (!this.formIsValid) return;

      //upload image
      const menuId = db.collection("random").doc().id;
      let file = await this.croppa.promisedBlob("image/jpeg", 0.8);
      let itemPhoto = await this.uploadFile(file, menuId);
      const itemData = {
        itemName: this.itemName,
        price: Number(this.price),
        tax: this.tax,
        itemDescription: this.itemDescription,
        itemPhoto: itemPhoto,
        availability: this.availability,
        titleFlag: false,
        uid: this.uid,
        createdAt: new Date()
      };
      const newData = await db.collection(`restaurants/${this.restaurantId()}/menus`).add(itemData);

      const menuLists = this.restaurantInfo.menuLists || [];
      menuLists.push(newData.id);
      await db.doc(`restaurants/${this.restaurantId()}`).update("menuLists", menuLists);

      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}/menus`
      });
    },
    uploadFile(file, menuId) {
      return new Promise((resolve, rejected) => {
        let storageRef = storage.ref();
        let mountainsRef = storageRef.child(
          `/images/restaurants/${this.restaurantId()}/menus/${menuId}/item.jpg`
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
    goBack() {
      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}/menus`
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
