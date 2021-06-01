<template>
  <div>
    <a :href="authUrl">連携する</a>
    <div v-for="(shop, k) in shopList" :key="k">
      {{shop.storeName}}
    </div>
  </div>
</template>

<script>
import { smaregi } from "@/config/project";
import { functions } from "~/plugins/firebase.js";

export default {
  name: "Restaurant",
  data() {
    return {
      authUrl: `${smaregi.authUrl}?response_type=code&client_id=${smaregi.clientId}&scope=openid+email+offline_access`,
      shopList: [],
    };
  },
  async mounted() {
    try {
      const smaregiAuth = functions.httpsCallable("smaregiStoreList");
      this.isValidating = true;
      const { data } = await smaregiAuth({
        client_id: smaregi.clientId,
      });
      this.shopList = data.res;
      console.log("smaregiAuth", data);
    } finally {
      this.isValidating = false;
    }
  },


};
</script>
