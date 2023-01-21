<template>
  <div>
    <button @click="download">Download menu example</button><br />
    <button @click="testPrint">Download test print</button><br />
    <button @click="testDownload">Download test download</button><br />
    <button @click="download4">Download logo print</button><br />
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { db } from "@/plugins/firebase";
import {
  stripeRegion,
  doc2data,
  array2obj,
  useNationalPhoneNumber,
  shareUrl,
  useBasePath,
} from "@/utils/utils";
import * as pdf from "@/lib/pdf/pdf";
import * as pdf2 from "@/lib/pdf/pdf2";

export default defineComponent({
  name: "pdf",
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const menuObj = ref(null);
    const restaurantRef = db.doc(`restaurants/${ctx.root.restaurantId()}`);
    (async () => {
      menuObj.value = array2obj(
        (
          await restaurantRef
            .collection("menus")
            .where("deletedFlag", "==", false)
            .get()
        ).docs.map(doc2data(""))
      );
    })();

    const { nationalPhoneNumber } = useNationalPhoneNumber(props.shopInfo);
    const download = () => {
      const basePath = useBasePath(ctx.root);
      pdf.menuDownload(
        props.shopInfo,
        menuObj.value,
        nationalPhoneNumber.value,
        shareUrl(ctx.root, basePath.value)
      );
    };
    const testPrint = async () => {
      const data = await pdf2.orderPrintData();
      const passprnt_uri = pdf2.data2UrlSchema(data, "2");
      location.href = passprnt_uri;
    };
    const testDownload = async () => {
      const data = await pdf2.orderPdfDownload();
      console.log(data);
    };
    const download4 = async () => {
      const data = await pdf2.testDownload();
      console.log(data);

      let passprnt_uri = "starpassprnt://v1/print/nopreview?";

      passprnt_uri =
        passprnt_uri + "back=" + encodeURIComponent(window.location.href);

      passprnt_uri = passprnt_uri + "&pdf=" + encodeURIComponent(data);

      // var target = document.getElementById("print");
      // target.href = passprnt_uri;
      console.log(passprnt_uri);
    };
    return {
      download,
      testPrint,
      testDownload,
      download4,
    };
  },
});
</script>
