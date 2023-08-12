<template>
  <section class="mx-auto max-w-full px-6 pb-12 pt-4">
    <back-button :url="backUrl" />
    <h2>All Restaurants</h2>
    <table>
      <tr>
        <td>nama</td>
        <td></td>
        <td>掲載</td>
        <td>公開</td>
        <td>削除</td>
        <td>メニュー数</td>
        <td></td>
        <td>電話通知</td>
        <td>宅配</td>
        <td>印刷</td>
        <td>Mo</td>
        <td>EC</td>
        <td>P</td>
        <td>G</td>
        <td>L</td>
      </tr>
      <tr v-for="restaurant in restaurants" :key="restaurant.id">
        <td style="width: 50%">
          <router-link
            class="text-sm font-bold text-op-teal"
            :to="`/r/${restaurant.id}`"
            v-if="restaurant.publicFlag && !restaurant.deletedFlag"
          >
            {{ (restaurant.restaurantName || "").slice(0, 30) }}
          </router-link>
          <span v-else>
            {{ (restaurant.restaurantName || "").slice(0, 30) }}
          </span>
        </td>
        <td>
          <router-link
            :to="`/s/admins/${restaurant.uid}`"
            class="text-sm font-bold text-op-teal"
            >管理人</router-link
          >
        </td>
        <td>
          {{ restaurant.onTheList ? "o" : "-" }}
        </td>
        <td>
          {{ restaurant.publicFlag ? "o" : "-" }}
        </td>
        <td>
          {{ restaurant.deletedFlag ? "o" : "-" }}
        </td>
        <td>
          {{ (restaurant.menuLists || []).length || "-" }}
        </td>
        <td>
          {{ moment(restaurant.createdAt.toDate()).format("YYYY/MM/DD HH:mm") }}
        </td>
        <td>
          {{ !!restaurant.phoneCall ? "o" : "-" }}
        </td>
        <td>
          {{ !!restaurant.enableDelivery ? "o" : "-" }}
        </td>
        <td>
          {{ !!restaurant.enablePrinter ? "o" : "-" }}
        </td>
        <td>
          {{ !!restaurant.enableMoPickup ? "o" : "-" }}
        </td>
        <td>
          {{ !!restaurant.isEC ? "o" : "-" }}
        </td>
        <td>
          {{ restaurant.groupId }}
        </td>
        <td>
          {{ restaurant.supportLiff }}
        </td>
        <td>
          <DownloadMenu :restaurantid="restaurant.id" />
        </td>
      </tr>
    </table>
    <hr />
    <o-button class="mt-2 h-9 rounded-full" @click="nextLoad">
      <span class="pl-4 pr-4">
        <span class="font-bold text-op-teal"> Next </span>
      </span>
    </o-button>

    <o-button class="mt-2 ml-4 h-9 rounded-full" @click="allLoad">
      <span class="pl-4 pr-4">
        <span class="font-bold text-op-teal"> All </span>
      </span>
    </o-button>

    <download-csv
      :data="tableData"
      :fields="fields"
      :fieldNames="fieldNames"
      :fileName="fileName"
    >
      <o-button class="mt-2 ml-4 h-9 rounded-full">
        <span class="pl-4 pr-4">
          <i class="material-icons mr-2 !text-2xl text-op-teal">save_alt</i>
          <span class="font-bold text-op-teal"> Download </span>
        </span>
      </o-button>
    </download-csv>
  </section>
</template>

<script lang="ts">
// TODO: 通知の状況もわかるようにする
//
import { defineComponent, ref, computed } from "vue";
import { doc2data } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";
import DownloadCsv from "@/components/DownloadCSV.vue";
import DownloadMenu from "@/app/super/DownloadCSV.vue";

import { useI18n } from "vue-i18n";
import { getBackUrl, superPermissionCheck } from "@/utils/utils";
import moment from "moment-timezone";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

import { db } from "@/lib/firebase/firebase9";
import {
  query,
  limit,
  orderBy,
  startAfter,
  getDocs,
  collection,
} from "firebase/firestore";

export default defineComponent({
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Restaurants"].join(" / "),
    };
  },
  components: {
    BackButton,
    DownloadCsv,
    DownloadMenu,
  },
  setup() {
    const { t } = useI18n({ useScope: 'global' });
    let isLoading = false;
    const restaurants = ref<RestaurantInfoData[]>([]);
    const last = ref<any | null>(null);

    superPermissionCheck();
    
    const loadData = async () => {
      if (!isLoading) {
        isLoading = true;
        let myQuery = query(
          collection(db, "restaurants"),
          orderBy("createdAt", "desc"),
          limit(100),
        );
        if (last.value) {
          myQuery = query(
            myQuery,
            startAfter(last.value)
          )
        }
        const snapshot = await getDocs(myQuery);
        if (!snapshot.empty) {
          last.value = snapshot.docs[snapshot.docs.length - 1];
          // @ts-ignore
          snapshot.docs.map(doc2data("resuatraut")).forEach((data) => {
            restaurants.value.push(data as RestaurantInfoData);
          });
        } else {
          last.value = null;
        }
      }
      isLoading = false;
    };
    const nextLoad = () => {
      if (last.value) {
        loadData();
      }
    };
    const allLoad = async () => {
      while (last.value) {
        await loadData();
      }
    };
    loadData();

    const fields = [
      "date",
      "restaurantName",
      "state",
      "onTheList",
      "publicFlag",
      "deletedFlag",
      "menu",
      "uid",
    ];
    const tableData = computed(() => {
      return restaurants.value.map((restaurant) => {
        return {
          // @ts-ignore
          date: moment(restaurant.createdAt.toDate()).format("YYYY/MM/DD"),
          restaurantName: restaurant.restaurantName,
          state: restaurant.state,
          onTheList: restaurant.onTheList ? 1 : 0,
          publicFlag: restaurant.publicFlag ? 1 : 0,
          deletedFlag: restaurant.deletedFlag ? 1 : 0,
          menu: (restaurant.menuLists || []).length || "-",
          uid: restaurant.uid,
        };
      });
    });

    return {
      fileName:  "restaurant",
      fields,
      fieldNames: fields.map((field) => {
        return t(`restaurantCsv.${field}`);
      }),
      tableData,
      restaurants,
      last,

      nextLoad,
      allLoad,

      backUrl: getBackUrl(),
      moment,
    };
}
});
</script>
