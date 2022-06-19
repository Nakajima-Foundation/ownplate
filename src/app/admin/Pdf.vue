<template>
  <div>
    <button @click="download">Download menu example</button><br />
    <button @click="testPrint">Download test print</button><br />
    <button @click="testDownload">Download test download</button><br />
    <button @click="download4">Download logo print</button><br />
  </div>
</template>

<script>
import { db } from "@/plugins/firebase";

import * as pdf from "@/lib/pdf/pdf";
import * as pdf2 from "@/lib/pdf/pdf2";

export default {
  name: "pdf",
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      restaurantInfo: {},
      menus: null,
      menuObj: null,
    };
  },
  async created() {
    const restaurantRef = db.doc(`restaurants/${this.restaurantId()}`);
    this.menuObj = this.array2obj(
      (
        await restaurantRef
          .collection("menus")
          .where("deletedFlag", "==", false)
          .get()
      ).docs.map(this.doc2data(""))
    );
  },
  computed: {
    // TODO: create method and move to utils. merge ShopInfo.vue
    // TODO: merge shopInfo and shopInfo
    parsedNumber() {
      const countryCode = this.shopInfo.countryCode || this.countries[0].code;
      try {
        return parsePhoneNumber(countryCode + this.shopInfo.phoneNumber);
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
      return this.shopInfo.phoneNumber;
    },
  },
  methods: {
    download() {
      pdf.menuDownload(
        this.shopInfo,
        this.menuObj,
        this.nationalPhoneNumber,
        this.shareUrl()
      );
    },
    async testPrint() {
      const data = await pdf2.orderPrintData();
      const passprnt_uri = pdf2.data2UrlSchema(data, "2");
      location.href = passprnt_uri;
    },
    async testDownload() {
      const data = await pdf2.orderPdfDownload();
      console.log(data);
    },
    async download4() {
      const data = await pdf2.testDownload();
      console.log(data);

      let passprnt_uri = "starpassprnt://v1/print/nopreview?";

      passprnt_uri =
        passprnt_uri + "back=" + encodeURIComponent(window.location.href);

      passprnt_uri = passprnt_uri + "&pdf=" + encodeURIComponent(data);

      // var target = document.getElementById("print");
      // target.href = passprnt_uri;
      console.log(passprnt_uri);
    },
    async download5() {},
  },
};
</script>
