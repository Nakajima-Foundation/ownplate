<template>
  <div>
    <div v-if="enable===null || isLoading === true">
      loading...
    </div>
    <div v-if="enable===false">
      <a :href="authUrl">連携する</a>
    </div>
    <div v-if="enable===true">
      <div v-for="(shop, k) in shopList" :key="k">
        {{shop.storeName}}
      </div>
    </div>
  </div>
</template>

<script>
import { smaregi } from "@/config/project";
import { db, functions } from "~/plugins/firebase.js";

export default {
  name: "Restaurant",
  data() {
    return {
      authUrl: `${smaregi.authUrl}?response_type=code&client_id=${smaregi.clientId}&scope=openid+email+offline_access`,
      shopList: [],
      enable: null,
      isLoading: false,
    };
  },

  async created() {
    const smaregiDoc = await db.doc(`admins/${this.uid}/public/smaregi`).get();
    this.enable = (smaregiDoc && smaregiDoc.exists);
    if (this.enable) {
      const smaregiData = smaregiDoc.data();
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
    }
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
  },


};
</script>
