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

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
} from "vue";

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

import { doc2data, array2obj, useAdminUids } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";

import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    BackButton,
  },
  metaInfo() {
    return {
      title: [this.defaultTitle, "Admin Smaregi Store"].join(" / "),
    };
  },
  setup() {
    const route = useRoute();

    const enable = ref<boolean | null>(null);
    const isLoading = ref(false);
    const productList = ref<any[]>([]);
    const storeData = ref<any>({});
    const menus = ref<any[]>([]);
    const menuObj = ref<any>({});

    const stockObj = ref<any>({});
    const selectedMenu = ref<any>({});
    const isEdit = ref(false);

    let contractId: string | null = null;
    let sRestaurantId: string | null = null;

    const { uid } = useAdminUids();
    const storeId = route.params.storeId as string

    const duplicateElement = computed(() => {
      const counter = Object.values(selectedMenu.value).reduce(
        (tmp: {[key: string]: number}, ele: any) => {
          if (ele === "00000") {
            return tmp;
          }
          if (tmp[ele] === undefined) {
            tmp[ele] = 1;
          } else {
            tmp[ele]++;
          }
          return tmp;
        },
        {}
      );
      return Object.keys(counter).reduce((tmp: {[key: string]: boolean}, key: any) => {
        if (counter[key] > 1) {
          tmp[key] = true;
        }
        return tmp;
      }, {});
    });
    const isDuplicateError = computed(() => {
      return Object.keys(duplicateElement.value).length > 0;
    });

    getDoc(doc(db, `admins/${uid.value}/private/smaregi`)).then(async (smaregiDoc) => {
      enable.value = smaregiDoc && smaregiDoc.exists();
      if (!enable.value) {
        return;
      }
      try {
        isLoading.value = true;
      
        const smaregiData = smaregiDoc.data();
        contractId = smaregiData?.smaregi?.contract?.id;
      
        storeData.value = (
          await getDoc(doc(db, `/smaregi/${contractId}/stores/${storeId}`))
        ).data();
        sRestaurantId = storeData.value.restaurantId;
        
        const _menus = await getDocs(query(
          collection(db, `restaurants/${sRestaurantId}/menus`),
          where("deletedFlag", "==", false),
          where("publicFlag", "==", true),
        ));
        
        menus.value = _menus.docs.map(doc2data("message")).sort((a, b) => {
          return a.itemName > b.itemName ? 1 : -1;
        });
        menuObj.value = menus.value.reduce((tmp, current) => {
          tmp[current.id] = current;
          return tmp;
        }, {});
        menus.value.unshift({
          id: "00000",
          itemName: "-----------------",
          price: "---",
        });
        
        const { data } = await smaregiProductList({
          store_id: storeId,
        });
        productList.value = data.res;
        
        isLoading.value = false;
        
        const productCollection = await getDocs(query(
          collection(db, `/smaregi/${contractId}/stores/${storeId}/products`),
          where("uid", "==", uid.value)
        ))
        const products = productCollection.docs.map(doc2data("stores"));
        
        const productObj = products.reduce((tmp, current) => {
          tmp[current.productId] = current;
          return tmp;
        }, {});
        
        const stockCollection = await getDocs(query(
          collection(db,
                     `smaregiData/${contractId}/stores/${storeId}/smaregiProducts`
                    )
        ));
        stockObj.value = array2obj(stockCollection.docs.map(doc2data("stock")));
        
        const _selectedMenu: any = {};
        (productList.value || []).map((product, key) => {
          const productId = product.productId;
          if (productObj[productId]) {
            _selectedMenu[key] = productObj[productId].menuId;
          }
        });
        selectedMenu.value = _selectedMenu;
      } catch (e) {
        console.log(e)
      }
    });
    const saveMenus = () => {
      if (isDuplicateError.value) {
        console.log("error");
        return;
      }
      (productList.value || []).map((product, key) => {
        const menuId = selectedMenu.value[key];
        // check uniq.
        const path = `/smaregi/${contractId}/stores/${storeId}/products/${product.productId}`;
        if (menuId && menuId !== "00000") {
          const data = {
            contractId: contractId,
            storeId,
            productId: product.productId,

            uid: uid.value,
            restaurantId: sRestaurantId,
            menuId,
          };
          setDoc(doc(db, path), data);
        } else {
          deleteDoc(doc(db, path));
        }
      });
      isEdit.value = false;
    };
    return {
      enable,
      isLoading,
      productList,
      storeData,
      menus,
      menuObj,

      stockObj,
      selectedMenu,
      isEdit,


      isDuplicateError,
      duplicateElement,

saveMenus,
};

  },
});
</script>
