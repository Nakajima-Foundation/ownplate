<template>
  <div class="pt-8">
    <div class="text-center">
      <download-csv :data="tableData" :fields="fields" :fileName="fileName">
        <div
          class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
        >
          <span class="text-base font-bold text-white"> CSV DOWNLOAD </span>
        </div>
      </download-csv>
    </div>
  </div>
</template>
<script>
import { defineComponent, computed, ref } from "@vue/composition-api";
import moment from "moment";

import { db } from "@/lib/firebase/firebase9";
import { collection, getDocs } from "firebase/firestore";

import DownloadCsv from "@/components/DownloadCSV.vue";

export default defineComponent({
  components: {
    DownloadCsv,
  },
  props: {
    restaurantid: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const tableData = ref([]);
    const loadData = async () => {
      const collectionData = await getDocs(
        collection(db, `restaurants/${props.restaurantid}/menus`)
      );
      collectionData.docs.map((doc) => {
        const menu = doc.data();
        console.log() ;
        const data = {
          productName: menu.itemName,
          productPriceWithTax: menu.price,
          productId: menu.productId,
          taxPercentage: menu.tax === "food" ? 8 : 10,
          categoryId: menu.category,
          subcategoryCd: menu.subcategoryCd,
          subcategoryId: menu.subCategory,
          productExplanation: menu.itemDescription,
          productNameAlias: menu.itemAliasesName,
          productImagePath: menu.images.item.path,
          noPublish: !menu.publicFlag ? 1 : 0,
          outofstock: menu.soldOut ? 1 : 0,
          delete: menu.deletedFlag ? 1 : 0,
          updateDate: menu.csvImportedAt ? moment(menu.csvImportedAt.toDate()).format()  : "",
        };
        tableData.value.push(data);
      });
    };
    loadData();

    const fileName = "menu";
    const fields = [
      "productName",
      "productPriceWithTax",
      "productId",
      "taxPercentage",
      "categoryId",
      "subcategoryCd",
      "subcategoryId",
      "productExplanation",
      "productNameAlias",
      "productImagePath",
      "noPublish",
      "outofstock",
      "delete",
      "updateDate",
    ];

    return {
      tableData,
      fields,
      fileName,
    };
  },
});
</script>
