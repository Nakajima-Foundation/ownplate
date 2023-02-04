<template>
  <div v-if="enable === null || isLoading === true">loading...</div>

  <div v-else>
    <!-- Header -->
    <div class="mx-6 mt-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <back-button url="/admin/restaurants/" />
      </div>

      <!-- Title -->
      <div class="mt-4 lg:mx-4 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
        <span class="text-base text-xl font-bold">
          {{ $t("admin.smaregi.index") }}
        </span>
      </div>
    </div>

    <div class="mx-6 mt-6">
      <div v-if="enable === false">
        <a :href="authUrl">連携する</a>
      </div>
      <div v-if="enable === true">
        <span class="text-base text-xl font-bold">
          {{ $t("admin.smaregi.smaregiShopList") }}
        </span>
        <div v-if="isEdit">
          <div v-for="(shop, k) in shopList" :key="k" class="border-2">
            {{ shop.storeName }}
            <o-select
              v-model="selectedRestaurant[k]"
              :class="
                selectedRestaurant[k] && duplicateElement[selectedRestaurant[k]]
                  ? 'border-2 border-solid border-red-700'
                  : ''
              "
            >
              <option
                v-for="restaurant in restaurants"
                :value="restaurant.id"
                :key="restaurant.id"
              >
                {{ restaurant.restaurantName }}
              </option>
            </o-select>

            在庫切れしきい値:
            <o-select v-model="outOfStockData[k]">
              <option
                v-for="threshold in outOfStockThresholds"
                :value="threshold.value"
                :key="threshold.value"
              >
                {{ threshold.name }}
              </option>
            </o-select>

            在庫復活しきい値:
            <o-select v-model="inStockData[k]">
              <option
                v-for="threshold in inStockThresholds"
                :value="threshold.value"
                :key="threshold.value"
              >
                {{ threshold.name }}
              </option>
            </o-select>
          </div>
          <div v-if="isDuplicateError">*お店の指定が重複しています</div>
          <o-button @click="saveShops" :disabled="isDuplicateError"
            >保存</o-button
          >
        </div>

        <div v-else>
          <div v-for="(shop, k) in shopList" :key="k">
            <div class="mt-2 text-base font-bold">
              <router-link :to="`/admin/smaregi/store/${shop.storeId}`">
                {{ shop.storeName }}
              </router-link>
            </div>
            {{ (restaurantObj[selectedRestaurant[k]] || {}).restaurantName
            }}<br />
            在庫切れしきい値:
            {{ showStockThreshold((outOfStockData || {})[k]) }} /
            在庫復活しきい値: {{ showStockThreshold((inStockData || {})[k]) }}
          </div>
          <div class="mt-4">
            <o-button @click="isEdit = true">編集</o-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
} from "vue";

import { smaregi } from "@/config/project";
import { db } from "@/lib/firebase/firebase9";
import { smaregiStoreList } from "@/lib/firebase/functions";

import { doc2data } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";

import {
  doc,
  getDocs,
  query,
  collection,
  where,
  updateDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";

const outOfStockThresholds = [
  { value: 999999, name: "なし" },
  { value: 0, name: "0" },
  { value: 1, name: "1" },
  { value: 2, name: "2" },
  { value: 3, name: "3" },
  { value: 4, name: "4" },
  { value: 5, name: "5" },
  { value: 10, name: "10" },
  { value: 20, name: "20" },
];

const inStockThresholds = [
  { value: 999999, name: "なし" },
  { value: 50, name: "50" },
  { value: 20, name: "20" },
  { value: 10, name: "10" },
  { value: 5, name: "5" },
  { value: 4, name: "4" },
  { value: 3, name: "3" },
];

// export default defineComponent({
 export default {
  components: {
    BackButton,
  },
  name: "Restaurant",
  metaInfo() {
    return {
      title: [this.defaultTitle, "Admin Smaregi Index"].join(" / "),
    };
  },
  data() {
    return {
      authUrl: `${smaregi.authUrl}?response_type=code&client_id=${smaregi.clientId}&scope=openid+email+offline_access`,
      shopList: [],
      enable: null,
      isLoading: false,
      selectedRestaurant: {},
      restaurants: [],
      restaurantObj: {},
      contractId: null,
      isEdit: false,

      outOfStockThresholds,
      outOfStockData: {},

      inStockThresholds,
      inStockData: {},
    };
  },

  async created() {
    const smaregiDoc = await getDoc(doc(db, `admins/${this.uid}/private/smaregi`));
    this.enable = smaregiDoc && smaregiDoc.exists();

    if (this.enable) {
      const smaregiData = smaregiDoc.data();
      this.contractId = smaregiData?.smaregi?.contract?.id;

      try {
        this.isLoading = true;
        const { data } = await smaregiStoreList({});
        this.shopList = data.res;
        // console.log("smaregiStoreList", data);
      } finally {
        this.isLoading = false;
      }
      const restaurantColleciton = await getDocs(
        query(
          collection(db, "restaurants"),
          where("publicFlag", "==", true),
          where("deletedFlag", "==", false),
          where("uid", "==", this.uid),
        )
      )
      this.restaurants = restaurantColleciton.docs
        .map(doc2data("message"))
        .sort((a, b) => {
          return a.restaurantName > b.restaurantName ? 1 : -1;
        });
      this.restaurantObj = this.restaurants.reduce((tmp, current) => {
        tmp[current.id] = current;
        return tmp;
      }, {});

      this.restaurants.unshift({
        id: "00000",
        restaurantName: "-----------------",
      });

      const storeCollection = await getDocs(
        query(
          collection(db, `/smaregi/${this.contractId}/stores`),
          where("uid", "==", this.uid)
        )
      )
      const stores = storeCollection.docs.map(doc2data("stores"));

      const storeObj = stores.reduce((tmp, current) => {
        tmp[current.storeId] = current;
        return tmp;
      }, {});

      const selectedRestaurant = {};
      (this.shopList || []).map((store, key) => {
        const storeId = store.storeId;
        if (storeObj[storeId]) {
          const { outOfStock, inStock } = storeObj[storeId];
          selectedRestaurant[key] = storeObj[storeId].restaurantId;

          this.outOfStockData[key] =
            outOfStock === undefined ? 999999 : outOfStock;
          this.inStockData[key] = inStock === undefined ? 999999 : inStock;
        }
      });
      this.selectedRestaurant = selectedRestaurant;
    }
  },
  methods: {
    saveShops() {
      if (this.isDuplicateError) {
        console.log("error");
        return;
      }

      (this.shopList || []).map((store, key) => {
        const restaurantId = this.selectedRestaurant[key];
        const outOfStock = this.outOfStockData[key];
        const inStock = this.inStockData[key];
        // check uniq.
        const storeId = store.storeId;
        const path = `/smaregi/${this.contractId}/stores/${storeId}`;

        if (restaurantId && restaurantId !== "00000") {
          const data = {
            storeName: store.storeName,
            contractId: this.contractId,
            storeId: storeId,
            uid: this.uid,
            restaurantId,
          };
          if (outOfStock !== 999999 && outOfStock !== undefined) {
            data.outOfStock = outOfStock;
          }
          if (inStock !== 999999 && inStock !== undefined) {
            data.inStock = inStock;
          }
          setDoc(doc(db, path), data);
          // console.log(this.selectedRestaurant[key]);
        } else {
          deleteDoc(doc(db, path));
          console.log("TODO DELETE");
        }
      });
      this.isEdit = false;
    },
    showStockThreshold(value) {
      if (value === undefined || value === 999999) {
        return "----";
      }
      return value;
    },
  },
  computed: {
    isDuplicateError() {
      return Object.keys(this.duplicateElement).length > 0;
    },
    duplicateElement() {
      const counter = Object.values(this.selectedRestaurant).reduce(
        (tmp, ele) => {
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
  },
};
</script>
