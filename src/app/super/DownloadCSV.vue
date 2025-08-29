<template>
  <div class="pt-8">
    <div class="text-center">
      <download-csv :data="tableData" :fields="fields" :fileName="fileName">
        <div
          class="bg-op-teal inline-flex h-12 items-center justify-center rounded-full px-6 shadow-sm"
        >
          <span class="text-base font-bold text-white"> CSV DOWNLOAD </span>
        </div>
      </download-csv>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
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
  setup(props) {
    const tableData = ref<any[]>([]);
    const loadData = async () => {
      const collectionData = await getDocs(
        collection(db, `restaurants/${props.restaurantid}/menus`),
      );
      collectionData.docs.forEach((doc) => {
        const menu = doc.data();
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
          productImagePath: menu.images?.item?.path,
          noPublish: menu.publicFlag ? 0 : 1,
          outofstock: menu.soldOut ? 1 : 0,
          delete: menu.deletedFlag ? 1 : 0,
          updateDate: menu.csvImportedAt
            ? moment(menu.csvImportedAt.toDate()).format()
            : "",
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
