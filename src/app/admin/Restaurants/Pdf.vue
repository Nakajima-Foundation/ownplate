<template>
  <div>
    <button @click="download">Download menu example</button><br />
    <button @click="testPrint">Download test print</button><br />
    <button @click="testDownload">Download test download</button><br />
    <button @click="download4">Download logo print</button><br />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDocs, collection, where, query } from "firebase/firestore";
import {
  stripeRegion,
  doc2data,
  array2obj,
  useNationalPhoneNumber,
  shareUrl,
  useBasePath,
  getRestaurantId,
} from "@/utils/utils";
import * as pdf from "@/lib/pdf/pdf";
import * as pdf2 from "@/lib/pdf/pdf2";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { MenuData } from "@/models/menu";

export default defineComponent({
  name: "pdf",
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
  setup(props) {
    const menuObj = ref<{ [key: string]: MenuData }>({});

    const restaurantId = getRestaurantId();
    const restaurantRef = doc(db, `restaurants/${restaurantId}`);
    (async () => {
      menuObj.value = array2obj(
        (
          await getDocs(
            query(
              collection(restaurantRef, "menus"),
              where("deletedFlag", "==", false)
            )
          )
        ).docs.map(doc2data<MenuData>(""))
      );
    })();

    const { nationalPhoneNumber } = useNationalPhoneNumber(props.shopInfo);
    const basePath = useBasePath();
    const url = shareUrl(basePath.value)

    const download = () => {
      pdf.menuDownload(
        props.shopInfo,
        menuObj.value,
        nationalPhoneNumber.value,
        url,
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
