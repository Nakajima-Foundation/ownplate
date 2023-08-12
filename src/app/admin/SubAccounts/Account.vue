<template>
  <div>
    <!-- Header -->
    <div class="mx-6 mt-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <back-button url="/admin/subaccounts/"
                     iconText="arrow_back"
                     backText="button.backToSubaccounts"
                     />
      </div>
    </div>

    <!-- Order Status -->
    <div class="mx-6 mt-6">
      <div class="mt-2">
        <span class="text-base font-bold">
          {{ $t("admin.subAccounts.name") }}
        </span>
        <o-input
          v-model="name"
          :placeholder="$t('admin.subAccounts.enterName')"
        ></o-input>

        <span class="text-base font-bold">
          {{ $t("admin.subAccounts.email") }} </span
        ><br />
        {{ child.email }} /
        {{
          $t(
            "admin.subAccounts.messageResult." +
              (child.accepted === true ? "accepted" : "waiting")
          )
        }}<br />
      </div>
      <div class="mt-2 rounded-lg bg-white p-4 shadow">
        <span class="font-bold">{{
          $t("admin.subAccounts.selectRestaurant")
        }}</span>
        <div v-for="(restaurant, k) in restaurants" :key="k">
          <o-checkbox v-model="restaurantListObj[restaurant.id]">{{
            restaurant.restaurantName
          }}</o-checkbox>
        </div>
      </div>
      <div class="mt-2">
        <o-button @click="saveList">
          {{ $t("editCommon.save") }}
        </o-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
} from "vue";

import BackButton from "@/components/BackButton.vue";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  collection,
  where,
  orderBy,
  DocumentData,
} from "firebase/firestore";

import { doc2data, array2obj, useAdminUids } from "@/utils/utils";

import { useRouter, useRoute } from "vue-router";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  components: {
    BackButton,
  },
  metaInfo() {
    return {
      title: [this.defaultTitle, "Admin Subaccount Account"].join(" / "),
    };
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const subAccountId = computed(() => {
      return route.params.subAccountId;
    });

    const restaurantObj = ref({});
    const restaurants = ref<RestaurantInfoData[]>([]);

    const { uid } = useAdminUids();

    getDocs(
      query(
        collection(db, "restaurants"),
        where("uid", "==", uid.value),
        where("deletedFlag", "==", false),
        orderBy("createdAt", "asc"),
      )
    ).then((restaurantCollection) => {
        restaurantObj.value = array2obj(
          restaurantCollection.docs.map(doc2data("restaurant"))
        );
        restaurants.value = restaurantCollection.docs
          .map(doc2data("restaurant"))
          .filter((r) => r.publicFlag) as RestaurantInfoData[];
      });
    const name = ref("");

    const child = ref<DocumentData | undefined | {[key: string]: string}>({});
    getDoc(doc(db, `admins/${uid.value}/children/${subAccountId.value}`))
      .then((childrenDoc) => {
        child.value = childrenDoc.data();
        name.value = child.value?.name;
      });

    const restaurantListObj = computed(() => {
      return (child.value?.restaurantLists || []).reduce((t: {[key: string]: boolean}, c: string) => {
        t[c] = true;
        return t;
      }, {});
    });

    const newRestaurantList = computed(() => {
      return Object.keys(restaurantListObj.value).reduce((tmp: string[], k: string) => {
        const c = restaurantListObj.value[k];
        if (c) {
          tmp.push(k);
        }
        return tmp;
      }, []);
    });

    const saveList = async () => {
      await updateDoc(
        doc(db, `admins/${uid.value}/children/${subAccountId.value}`),
        {
          restaurantLists: newRestaurantList.value,
          name: name.value,
        });
      router.push("/admin/subaccounts/");
    };

    return {
      restaurantObj,
      restaurants,
      child,
      restaurantListObj,
      name,

      saveList,
    };
  },
});
</script>
