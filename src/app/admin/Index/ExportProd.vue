<template>
  <div
    class="flex h-14 cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-5 px-4 text-op-teal"
    @click="download"
  >
    <i class="material-icons mr-2 text-lg">save_alt</i>
    <div class="text-sm font-bold leading-tight">
      {{ $t("mobileOrder.downloadProductsList") }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDocs, collection } from "firebase/firestore";

import { data2csv } from "@/utils/csv";
import moment from "moment";

export default defineComponent({
  props: {
    restaurantLists: {
      type: Array,
      required: true,
    },
    restaurantItems: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    let csvData = [];
    let loading = false;
    const download = async () => {
      if (loading) {
        return;
      }
      loading = true;
      ctx.root.$store.commit("setLoading", true);
      csvData = {};

      const downloadAct = (data) => {
        const blob = new Blob([data], {
          type: `application/csv`,
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `productsList.csv`;
        link.click();
      };
      const parseMenuData = (a, restaurantId, shopId) => {
        const menuId = a.id;
        if (!csvData[shopId][menuId]) {
          csvData[shopId][menuId] = {
            productSearchStock: false,
            isStockSearchStock: false,
            restaurantId,
          };
        }
        const productId = a.data().productId || menuId;
        csvData[shopId][menuId]["productId"] = productId;
      };
      const parseData = (a, restaurantId, shopId, type) => {
        const data = a.data();
        // console.log(data);
        Object.keys(data.data).forEach((menuId) => {
          if (!csvData[shopId][menuId]) {
            csvData[shopId][menuId] = {
              productSearchStock: false,
              isStockSearchStock: false,
              restaurantId,
            };
          }
          if (!csvData[shopId][menuId]["productId"]) {
            csvData[shopId][menuId]["productId"] = menuId;
          }
          const d = data.data[menuId];
          if (type === "pickup") {
            csvData[shopId][menuId]["productPickup"] = d["isPublic"];
            csvData[shopId][menuId]["productPickupUpdateDate"] = d[
              "isPublicCSVImportedAt"
            ]
              ? moment(d["isPublicCSVImportedAt"].toDate()).format()
              : "";
          }
          if (type === "preOrder") {
            csvData[shopId][menuId]["productPreorder"] = d["isPublic"];
            csvData[shopId][menuId]["productPreorderUpdateDate"] = d[
              "isPublicCSVImportedAt"
            ]
              ? moment(d["isPublicCSVImportedAt"].toDate()).format()
              : "";
          }
          if (type === "pickupStock") {
            csvData[shopId][menuId]["forcePickupStock"] = d["forcePickupStock"];
            csvData[shopId][menuId]["forcePickupStockUpdateDate"] = d[
              "forcePickupStockCSVImportedAt"
            ]
              ? moment(d["forcePickupStockCSVImportedAt"].toDate()).format()
              : "";
          }
        });
      };

      for await (const restaurantId of props.restaurantLists) {
      // for await (const restaurantId of ["Nc51IWDVuidWOpvcnjqd"]) {
        const restaurant = props.restaurantItems[restaurantId] || {};
        const shopId = restaurant.shopId || restaurantId;
        csvData[shopId] = {};

        const mCollection = await getDocs(
          collection(db, `restaurants/${restaurantId}/menus`)
        );
        mCollection.docs.forEach((a) => parseMenuData(a, restaurantId, shopId));

        const pCollection = await getDocs(
          collection(db, `restaurants/${restaurantId}/pickup/data/subCategory`)
        );
        pCollection.docs.forEach((a) =>
          parseData(a, restaurantId, shopId, "pickup")
        );

        const fCollection = await getDocs(
          collection(db, `restaurants/${restaurantId}/pickup/stock/subCategory`)
        );
        fCollection.docs.forEach((a) =>
          parseData(a, restaurantId, shopId, "pickupStock")
        );

        const oCollection = await getDocs(
          collection(
            db,
            `restaurants/${restaurantId}/preOrder/data/subCategory`
          )
        );
        oCollection.docs.forEach((a) =>
          parseData(a, restaurantId, shopId, "preOrder")
        );
      }
      console.log(csvData);
      const tableData = [];
      Object.keys(csvData).forEach((shopId) => {
        Object.keys(csvData[shopId]).forEach((menuId) => {
          const data = csvData[shopId][menuId];
          // productId,productPreorder,productPickup,forcePickupStock,productSearchStock,isStockSearchStock,shopId
          const {
            productId,
            productPreorder,
            productPreorderUpdateDate,
            productPickup,
            productPickupUpdateDate,
            forcePickupStock,
            forcePickupStockUpdateDate,
            forcePickupStockData,
            productSearchStock,
            isStockSearchStock,
            restaurantId,
          } = data;

          tableData.push({
            productId,
            productPreorder: productPreorder ? "1" : "0",
            productPreorderUpdateDate,
            productPickup: productPickup ? "1" : "0",
            productPickupUpdateDate,
            forcePickupStock: forcePickupStock ? "1" : "0",
            forcePickupStockUpdateDate,
            productSearchStock: productSearchStock ? "1" : "0",
            isStockSearchStock: isStockSearchStock ? "1" : "0",
            shopId,
            menuId,
            restaurantId,
          });
        });
      });
      // console.log(tableData);
      const fields = [
        "productId",
        "productPreorder",
        "productPreorderUpdateDate",
        "productPickup",
        "productPickupUpdateDate",
        "forcePickupStock",
        "forcePickupStockUpdateDate",
        "productSearchStock",
        "isStockSearchStock",
        "shopId",
        "menuId",
        "restaurantId",
      ];
      const fieldNames = [
        "productId",
        "productPreorder",
        "productPreorderUpdateDate",
        "productPickup",
        "productPickupUpdateDate",
        "forcePickupStock",
        "forcePickupStockUpdateDate",
        "productSearchStock",
        "isStockSearchStock",
        "shopId",
        "menuId",
        "restaurantId",
      ];

      const dlData = data2csv(
        {
          data: tableData,
          fields,
          fieldNames,
        },
        ctx
      );
      downloadAct(dlData);

      ctx.root.$store.commit("setLoading", false);
      loading = false;
    };

    return {
      download,
    };
  },
});
</script>
