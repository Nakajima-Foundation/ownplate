<template>
  <div>
    <button @click="download">Download menu example</button><br/>
    <button @click="testPrint">Download test print</button><br/>
    <button @click="testDownload">Download test download</button><br/>
    <button @click="testDownloadAsync">Download test download async</button><br/>
    <button @click="download4">Download logo print</button><br/>
    <button @click="download5">Download logo download</button><br/>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";

import * as pdf from '../../plugins/pdf.js';
import * as pdf2 from '../../plugins/pdf2.js';

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
      pdf.menuDownload(this.restaurantInfo,  this.menuObj, this.nationalPhoneNumber, this.shareUrl());
    },
    async testPrint() {
      const data = await pdf2.orderPrintData();
      let passprnt_uri = "starpassprnt://v1/print/nopreview?";
      passprnt_uri = passprnt_uri + "back=" + encodeURIComponent(window.location.href);
      passprnt_uri = passprnt_uri + "&pdf=" + encodeURIComponent(data);
      passprnt_uri = passprnt_uri + "&size=2";
      location.href = passprnt_uri;
    },
    async testDownload() {
      const data = await pdf2.orderDownload();
      console.log(data);

    },
    async testDownloadAsync() {
      setTimeout(async () => {
        const data = await pdf2.orderPrintData();
        let passprnt_uri = "starpassprnt://v1/print/nopreview?";
        passprnt_uri = passprnt_uri + "back=" + encodeURIComponent(window.location.href);
        passprnt_uri = passprnt_uri + "&pdf=" + encodeURIComponent(data);
        passprnt_uri = passprnt_uri + "&size=2";
        location.href = passprnt_uri;
      }, 5000);
    },
    async download4() {
      const data = await pdf2.testDownload();
      console.log(data);

      let passprnt_uri = "starpassprnt://v1/print/nopreview?";
      
      passprnt_uri = passprnt_uri + "back=" + encodeURIComponent(window.location.href);

      passprnt_uri = passprnt_uri + "&pdf=" + encodeURIComponent(data);

      // var target = document.getElementById("print");
      // target.href = passprnt_uri;
      console.log(passprnt_uri)
    },
    async download5() {
    },
  }
}
</script>
