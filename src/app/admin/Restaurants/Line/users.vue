<template>
  <div>
    <div v-if="notFound == null"></div>
    <div v-else-if="notFound == true">
      <NotFound />
    </div>
    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mx-6 mt-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="`/admin/restaurants`"
        :showSuspend="false"
      />

      <!-- Body -->
      <div class="grid-col-1 mx-6 mt-6 space-y-4 lg:mx-auto lg:max-w-2xl">
        <!-- Title -->
        <div
          class="text-xl font-bold text-black text-opacity-30"
        >
          {{ $t("admin.line.users") }}
        </div>
      </div>
      <div class="m-6">
        <div v-for="(user, k) in users" :key="k">
          <img :src="user.profile.pictureUrl" class="w-12"/> {{ user.profile.displayName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from "vue";

import { checkShopAccount } from "@/utils/userPermission";
import { useAdminUids, notFoundResponse } from "@/utils/utils";

import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDocs,
  collection,
  DocumentData,
} from "firebase/firestore";


export default defineComponent({
  components: {
    AdminHeader,
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {

    const { ownerUid, uid } = useAdminUids();
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }

    const users = ref<DocumentData[]>([]);
    const loadUsers = async () => { 
      const col = await getDocs(collection(db, `restaurants/${props.shopInfo.restaurantId}/lineUsersData`))
      users.value = col.docs.map(a => a.data());
    };
    loadUsers();
    
    
    return {
      users,
      notFound: false,
    };
  }
});

</script>
