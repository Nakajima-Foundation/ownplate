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

import { db } from "@/lib/firebase/firebase9";
import { collection, getDocs } from "firebase/firestore";

import DownloadCsv from "@/components/DownloadCSV.vue";

export default defineComponent({
  components: {
    DownloadCsv,
  },
  setup(props, ctx) {
    const menuRestaurantId = props.isInMo
      ? props.groupMasterRestaurant.restaurantId
      : ctx.root.$route.params.restaurantId;

    const tableData = ref([]);
    const loadData = async () => {
      const collectionData = await getDocs(
        collection(db, `restaurants/${menuRestaurantId}/menus`)
      );
      collectionData.docs.map((doc) => {
        const menu = doc.data();
        console.log(menu);
        const data = {
          productName: menu.itemName,
          productPriceWithTax: menu.price,
          productId: menu.productId,
          taxPercentage: menu.tax === "food" ? 8 : 10,
          categoryId: menu.category,
          subcategoryCd: "",
          subcategoryId: menu.subCategory,
          productExplanation: menu.itemDescription,
          productNameAlias: menu.itemAliasesName,
          productImagePath: "",
          noPublish: !menu.publicFlag ? 1 : 0,
          outofstock: menu.soldOut ? 1 : 0,
          delete: menu.deletedFlag ? 1 : 0,
        };
        tableData.value.push(data);
      });
    };
    loadData();

    const fileName = "menu.csv";
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
    ];

    return {
      tableData,
      fields,
      fileName,
    };
  },
});
</script>
