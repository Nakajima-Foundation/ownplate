<template>
  <div v-if="enable === null || isLoading === true">loading...</div>

  <div v-else>
    <!-- Header -->
    <div class="mx-6 mt-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <back-button url="/admin/smaregi/index" />
      </div>

      <!-- Title -->
      <div class="mt-4 lg:mx-4 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
        <span class="text-base text-xl font-bold">
          {{ $t("admin.smaregi.index") }}
        </span>
      </div>
    </div>

    <div class="mx-6 mt-6">
      <span class="text-base text-xl font-bold">
        {{ storeData.storeName }}
      </span>
      <div v-if="isEdit">
        <div
          v-for="(product, key) in productList"
          :key="key"
          class="mt4 border-2"
        >
          スマレジ: {{ product.productCode }} / {{ product.productName }} /
          {{ product.price }}円 / 在庫数
          {{ (stockObj[product.productId] || {}).amount || 0 }} <br />
          おもちかえり:
          <o-select
            v-model="selectedMenu[key]"
            :class="
              selectedMenu[key] && duplicateElement[selectedMenu[key]]
                ? 'border-2 border-solid border-red-700'
                : ''
            "
          >
            <option v-for="menu in menus" :value="menu.id" :key="menu.id">
              {{ menu.itemName }} / {{ menu.price }} 円
            </option>
          </o-select>
        </div>
        <div v-if="isDuplicateError" class="text-red-700">
          * メニューの指定が重複しています
        </div>
        <o-button @click="saveMenus" :disabled="isDuplicateError"
          >保存</o-button
        >
      </div>
      <div v-else>
        <div class="mt-4">
          <div
            v-for="(product, key) in productList"
            :key="key"
            class="mt-2 border-2"
          >
            スマレジ:{{ product.productCode }} / {{ product.productName }} /
            {{ product.price }}円 / 在庫数
            {{ (stockObj[product.productId] || {}).amount || 0 }} <br />

            おもちかえり:
            <span v-if="menuObj[selectedMenu[key]]"
              >{{ menuObj[selectedMenu[key]].itemName }} /
              {{ menuObj[selectedMenu[key]].price }}円</span
            >
          </div>
          <o-button @click="isEdit = true">編集</o-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { smaregi } from "@/config/project";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { smaregiProductList } from "@/lib/firebase/functions";

import { doc2data, array2obj } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";

export default {
  components: {
    BackButton,
  },
  name: "Smaregi-store",
  metaInfo() {
    return {
      title: [this.defaultTitle, "Admin Smaregi Store"].join(" / "),
    };
  },
  data() {
    return {
      enable: null,
      isLoading: false,
      productList: [],
      contractId: null,
      sRestaurantId: null,
      storeData: {},
      menus: [],
      menuObj: {},
      stockObj: {},
      selectedMenu: {},
      isEdit: false,
    };
  },

  async created() {
    try {
      const smaregiDoc = await getDoc(doc(db, `admins/${this.uid}/private/smaregi`));

      this.enable = smaregiDoc && smaregiDoc.exists;
      if (!this.enable) {
        return;
      }
      this.isLoading = true;
      
      const smaregiData = smaregiDoc.data();
      this.contractId = smaregiData?.smaregi?.contract?.id;
      
      console.log("A");
      this.storeData = (
        await getDoc(doc(db, `/smaregi/${this.contractId}/stores/${this.storeId}`))
      ).data();
      this.sRestaurantId = this.storeData.restaurantId;
      console.log("A");
      
      const menus = await getDocs(query(
        collection(db, `restaurants/${this.sRestaurantId}/menus`),
        where("deletedFlag", "==", false),
        where("publicFlag", "==", true),
      ));
      
      this.menus = menus.docs.map(doc2data("message")).sort((a, b) => {
        return a.itemName > b.itemName ? 1 : -1;
      });
      this.menuObj = this.menus.reduce((tmp, current) => {
        tmp[current.id] = current;
        return tmp;
      }, {});
      this.menus.unshift({
        id: "00000",
        itemName: "-----------------",
        price: "---",
      });
      
      const { data } = await smaregiProductList({
        store_id: this.storeId,
      });
      this.productList = data.res;
      
      this.isLoading = false;
      
      const productCollection = await getDocs(query(
        collection(db, `/smaregi/${this.contractId}/stores/${this.storeId}/products`),
        where("uid", "==", this.uid)
      ))
      const products = productCollection.docs.map(doc2data("stores"));
      
      const productObj = products.reduce((tmp, current) => {
        tmp[current.productId] = current;
        return tmp;
      }, {});
      
      const stockCollection = await getDocs(query(
        collection(db,
                   `smaregiData/${this.contractId}/stores/${this.storeId}/smaregiProducts`
                  )
      ));
      this.stockObj = array2obj(stockCollection.docs.map(doc2data("stock")));
      
      const selectedMenu = {};
      (this.productList || []).map((product, key) => {
        const productId = product.productId;
        if (productObj[productId]) {
          selectedMenu[key] = productObj[productId].menuId;
        }
      });
      this.selectedMenu = selectedMenu;
    } catch (e) {
      console.log(e)
    }
  },
  methods: {
    saveMenus() {
      if (this.isDuplicateError) {
        console.log("error");
        return;
      }
      (this.productList || []).map((product, key) => {
        const menuId = this.selectedMenu[key];
        // check uniq.
        const path = `/smaregi/${this.contractId}/stores/${this.storeId}/products/${product.productId}`;
        if (menuId && menuId !== "00000") {
          const data = {
            contractId: this.contractId,
            storeId: this.storeId,
            productId: product.productId,

            uid: this.uid,
            restaurantId: this.sRestaurantId,
            menuId,
          };
          setDoc(doc(db, path), data);
        } else {
          deleteDoc(doc(db, path));
        }
      });
      this.isEdit = false;
    },
  },
  computed: {
    isDuplicateError() {
      return Object.keys(this.duplicateElement).length > 0;
    },
    duplicateElement() {
      const counter = Object.values(this.selectedMenu).reduce((tmp, ele) => {
        if (ele === "00000") {
          return tmp;
        }
        if (tmp[ele] === undefined) {
          tmp[ele] = 1;
        } else {
          tmp[ele]++;
        }
        return tmp;
      }, {});
      return Object.keys(counter).reduce((tmp, key) => {
        if (counter[key] > 1) {
          tmp[key] = true;
        }
        return tmp;
      }, {});
    },

    uid() {
      return this.$store.getters.uidAdmin;
    },
    storeId() {
      return this.$route.params.storeId;
    },
  },
};
</script>
