<template>
<div v-if="enable===null || isLoading === true">
    loading...
</div>

<div v-else >
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
        <!-- Back and Preview -->
        <div class="flex space-x-4">
            <back-button url="/admin/restaurants/" />
        </div>

        <!-- Title -->
        <div class="mt-4 lg:mt-0 lg:flex-1 lg:flex lg:items-center lg:mx-4">
            <span class="text-base font-bold  text-xl">
                {{ $t("admin.smaregi.index") }}
            </span>
        </div>
    </div>

    <div class="mx-6 mt-6">
        <div v-if="enable===false">
            <a :href="authUrl">連携する</a>
        </div>
        <div v-if="enable===true">
            <span class="text-base font-bold  text-xl">
              {{ $t("admin.smaregi.smaregiShopList") }}
            </span>
            <div v-if="isEdit">
              <div v-for="(shop, k) in shopList" :key="k">
                {{shop.storeName}}
                <b-select v-model="selectedRestaurant[k]"
                          :class="selectedRestaurant[k] && duplicateElement[selectedRestaurant[k]] ? 'border-red-700 border-2 border-solid' : ''"
                          >
                  <option
                    v-for="restaurant in restaurants"
                    :value="restaurant.id"
                    :key="restaurant.id"
                    >
                    {{ restaurant.restaurantName }}
                  </option>
                </b-select>
              </div>
              <div v-if="isDuplicateError">
                *お店の指定が重複しています
              </div>
              <b-button @click="saveShops" :disabled="isDuplicateError">保存</b-button>
            </div>

            <div v-else>
              <div v-for="(shop, k) in shopList" :key="k">
                <div class="mt-2 text-base font-bold">
                  <router-link :to="`/admin/smaregi/store/${shop.storeId}`" >
                    {{shop.storeName}}
                  </router-link>
                </div>
                {{(restaurantObj[selectedRestaurant[k]] ||{}).restaurantName}}
              </div>
              <div class="mt-4">
                <b-button @click="isEdit=true">編集</b-button>
              </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { smaregi } from "@/config/project";
import { db, functionsJp } from "~/plugins/firebase.js";

import BackButton from "~/components/BackButton";


export default {
  components: {
    BackButton
  },
  name: "Restaurant",
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
    };
  },

  async created() {
    const smaregiDoc = await db.doc(`admins/${this.uid}/private/smaregi`).get();
    this.enable = (smaregiDoc && smaregiDoc.exists);

    if (this.enable) {
      const smaregiData = smaregiDoc.data();
      this.contractId = smaregiData?.smaregi?.contract?.id;

      try {
        const smaregiAuth = functionsJp.httpsCallable("smaregiStoreList");
        this.isLoading = true;
        const { data } = await smaregiAuth({
          client_id: smaregi.clientId,
        });
        this.shopList = data.res;
        console.log("smaregiAuth", data);
      } finally {
        this.isLoading = false;
      }
      const restaurantColleciton =  await db.collection("restaurants")
            .where("publicFlag", "==", true)
            .where("deletedFlag", "==", false)
            .where("uid", "==", this.uid)
            .get();
      this.restaurants = restaurantColleciton.docs.map(this.doc2data("message")).sort((a, b) => {
        return a.restaurantName > b.restaurantName ? 1 : -1;
      });
      this.restaurantObj = this.restaurants.reduce((tmp, current) => {
        tmp[current.id] = current;
        return tmp;
      }, {});

      this.restaurants.unshift({id: "00000", restaurantName: "-----------------"})

      const storeCollection = await db.collection(`/smaregi/${this.contractId}/stores`).where("uid", "==", this.uid).get();
      const stores = storeCollection.docs.map(this.doc2data("stores"));

      const storeObj = stores.reduce((tmp, current) => {
        tmp[current.storeId] = current;
        return tmp;
      }, {});

      const selectedRestaurant = {};
      (this.shopList ||[]).map((store, key) => {
        const storeId = store.storeId;
        if (storeObj[storeId]) {
          selectedRestaurant[key] = storeObj[storeId].restaurantId;
        };
      });
      this.selectedRestaurant = selectedRestaurant;
    }
  },
  methods: {
    saveShops() {
      if (this.isDuplicateError) {
        console.log("error");
        return ;
      }

      (this.shopList ||[]).map((store, key) => {
        const restaurantId = this.selectedRestaurant[key];
        // check uniq.
        const storeId = store.storeId;
        const path = `/smaregi/${this.contractId}/stores/${storeId}`
        console.log(path);
        if (restaurantId && restaurantId !== "00000") {
          const data = {
            storeName: store.storeName,
            contractId: this.contractId,
            storeId: storeId,
            uid: this.uid,
            restaurantId,
          }
          db.doc(path).set(data);
          // console.log(this.selectedRestaurant[key]);
        } else {
          db.doc(path).delete();
          console.log("TODO DELETE");
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
      const counter = Object.values(this.selectedRestaurant).reduce((tmp, ele) => {
        if (tmp[ele] === undefined) {
          tmp[ele] = 1;
        } else {
          tmp[ele] ++;
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
  },


};
</script>
