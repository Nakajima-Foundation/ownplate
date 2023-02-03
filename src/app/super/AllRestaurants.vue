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
        <td>P</td>
        <td>G</td>
      </tr>
      <tr v-for="restaurant in restaurants" :key="restaurant.id">
        <td style="width: 50%">
          <router-link
            class="text-sm font-bold text-op-teal"
            :to="`/r/${restaurant.id}`"
            v-if="restaurant.publicFlag && !restaurant.deletedFlag"
          >
            {{ restaurant.restaurantName }}
          </router-link>
          <span v-else>
            {{ restaurant.restaurantName }}
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
import { defineComponent, onMounted, ref, computed } from "vue";
import { db } from "@/plugins/firebase";

import { doc2data } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";
import DownloadCsv from "@/components/DownloadCSV.vue";
import DownloadMenu from "@/app/admin/MenuListPage/DownloadCSV.vue";

import { useI18n } from "vue-i18n";
import { getBackUrl, superPermissionCheck } from "@/utils/utils";
import moment from "moment-timezone";

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
  data() {
    return {
      last: null,
    };
  },
  setup() {
    const { t } = useI18n({ useScope: 'global' });
    let isLoading = false;
    const restaurants = ref([]);
    const last = ref(null);

    superPermissionCheck();
    
    const loadData = async () => {
      if (!isLoading) {
        isLoading = true;
        let query = db
          .collection("restaurants")
          .orderBy("createdAt", "desc")
          .limit(100);
        if (last.value) {
          query = query.startAfter(last.value);
        }
        const snapshot = await query.get();
        if (!snapshot.empty) {
          last.value = snapshot.docs[snapshot.docs.length - 1];
          snapshot.docs.map(doc2data("resuatraut")).forEach((data) => {
            restaurants.value.push(data);
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
      // TODO
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
    };
}
});
</script>
