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
            <div v-for="(shop, k) in shopList" :key="k">
                {{shop.storeName}}
                <b-select v-model="selectedRestaurant[k]">
                  <option
                    v-for="restaurant in restaurants"
                    :value="restaurant.id"
                    :key="restaurant.id"
                    >
                    {{ restaurant.restaurantName }}
                  </option>
                </b-select>

            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { smaregi } from "@/config/project";
import { db, functions } from "~/plugins/firebase.js";

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
    };
  },

  async created() {
    const smaregiDoc = await db.doc(`admins/${this.uid}/public/smaregi`).get();
    // console.log(this.uid);
    this.enable = (smaregiDoc && smaregiDoc.exists);
    if (this.enable) {
      const smaregiData = smaregiDoc.data();

      // console.log(smaregiData);
      try {
        const smaregiAuth = functions.httpsCallable("smaregiStoreList");
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
            .where("uid", "==", this.uid)
            .where("deletedFlag", "==", false)
            .orderBy("createdAt", "asc").get();
      this.restaurants = restaurantColleciton.docs.map(this.doc2data("message"));
      this.restaurants.unshift({id: "00000", restaurantName: "-----------------"})
      console.log(this.restaurants);

      this.shopList.map((s) => {
        console.log(s);
        // this.selectedRestaurant
      });

    }
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
  },


};
</script>
