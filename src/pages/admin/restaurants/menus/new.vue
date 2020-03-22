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
      <div class="column">
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
        <b-field type="is-white">
          <b-input
            v-model="price"
            type="text"
            placeholder="Enter price"
            maxlength="15"
          ></b-input>
        </b-field>
      </div>
      <div class="column">
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
    <b-field class="file">
      <div class="columns">
        <div class="column is-harf">
          <img :src="itemPhotoImageUrl" />
        </div>
        <div class="column is-harf">
          <b-upload v-model="itemPhoto" type="is-link">
            <a class="button">
              <span>Add image</span>
            </a>
          </b-upload>
        </div>
      </div>
    </b-field>

    <b-button
      :disabled="!formIsValid"
      style="margin-right:auto"
      type="is-info"
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
import { db } from "~/plugins/firebase.js";

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

export default {
  name: "Order",
  data() {
    return {
      itemName: "",
      price: "",
      tax: "",
      itemDescription: "",
      itemPhoto: null,
      itemPhotoImageUrl: "/no_image.jpg",
      taxRates: TAX_RATES,
      uid: "hogehoge" //TODO test
    };
  },
  computed: {
    formIsValid() {
      debugger;
      return this.itemName !== "" && this.price !== "" && this.tax !== "";
    }
  },
  watch: {
    itemPhoto: function(val) {
      let filename = this.itemPhoto.name;
      if (filename.lastIndexOf(".") <= 0) {
        return alert("Please add a valid file!");
      }
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        this.itemPhotoImageUrl = fileReader.result;
      });
      fileReader.readAsDataURL(this.itemPhoto);
    }
  },
  methods: {
    async submitItem() {
      if (!this.formIsValid) return;

      const itemData = {
        itemName: this.itemName,
        price: this.price,
        tax: this.tax,
        itemDescription: this.itemDescription,
        itemPhoto: this.itemPhoto
      };
      await this.createItemData(this.$route.query.id, itemData);

      this.$router.push({
        path: `/admin/restaurants/menus/?id=${this.$route.query.id}`
      });
    },
    createItemData(restaurantId, itemData) {
      debugger;
      return new Promise((resolve, rejected) => {
        db.collection("restaurants")
          .doc(restaurantId)
          .collection("menus")
          .add(itemData)
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
