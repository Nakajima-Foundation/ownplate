<template>
  <div>
    <button @click="download">Download menu example</button><br/>
    <button @click="download2">Download logo</button><br/>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";

import * as pdf from '../../plugins/pdf.js';

export default {
  name: "pdf",
  data() {
    return {
      restaurantInfo: {},
      menus: null,
      menuObj: null,
    };
  },
  async created() {
    const restaurantRef = db.doc(`restaurants/${this.restaurantId()}`);
    this.restaurantInfo = (await restaurantRef.get()).data();
    this.menuObj = this.array2obj((await restaurantRef.collection("menus").where("deletedFlag", "==", false).get()).docs.map(this.doc2data("")));
  },
  computed: {
    // TODO: create method and move to utils. merge ShopInfo.vue
    // TODO: merge restaurantInfo and shopInfo
    parsedNumber() {
      const countryCode = this.restaurantInfo.countryCode || this.countries[0].code;
      try {
        return parsePhoneNumber(countryCode + this.restaurantInfo.phoneNumber);
      } catch (error) {
        return null;
      }
    },
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
    nationalPhoneNumber() {
      const number = this.parsedNumber;
      if (number) {
        return formatNational(number);
      }
      return this.restaurantInfo.phoneNumber;
    },
  },
  methods: {
    download() {
      pdf.download(this.restaurantInfo,  this.menuObj, this.nationalPhoneNumber, this.shareUrl());
    },
    download2() {

    },
  }
}
</script>
