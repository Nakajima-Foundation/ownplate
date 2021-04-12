<template>
  <div>
    <!-- View All -->
    <div>
      <div class="text-xl font-bold text-black text-opacity-40 mt-6 mx-6">
        {{ $t("find.area") }}
      </div>
      <div
        class="mt-2 mx-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <area-item :name="$t('find.areaAll')" :id="'all'" />
      </div>
    </div>

    <!-- Areas -->
    <div v-for="area in areas">
      <div class="text-base font-bold text-black text-opacity-40 mt-6 mx-6">
        {{ $t("find.areas." + area.name) }}
      </div>
      <div
        class="mt-2 mx-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <area-item
          v-for="item in area.items"
          :name="item.name"
          :id="String(item.id)"
          :key="item.id"
        />
      </div>
    </div>

    <!-- Likes -->
    <div v-if="likes.length > 0">
      <div class="text-xl font-bold text-black text-opacity-40 mt-6 mx-6">
        {{ $t("find.likes") }}
      </div>
      <div
        class="mt-2 mx-6 grid items-center grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div v-for="like in likes" :key="like.restaurantId">
          <router-link :to="`/r/${like.restaurantId}`">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-full bg-black bg-opacity-10 mr-4">
                <img
                  :src="resizedProfileImage(like, '600')"
                  class="w-12 h-12 rounded-full cover"
                />
              </div>
              <div class="flex-1 text-base font-bold pr-2">
                {{ like.restaurantName }}
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import { RestaurantHeader } from "~/plugins/header.js";
import AreaItem from "~/app/user/Restaurants/AreaItem";
import { ownPlateConfig } from "@/config/project";

export default {
  components: {
    AreaItem
  },
  data() {
    return {
      // # Need to rewrite for Areas instead of Restaurants.
      region: ownPlateConfig.region,
      likes: [],
      restaurants: [],
      areas:
        ownPlateConfig.region == "JP"
          ? [
              {
                name: "hokkaido",
                items: [{ name: "北海道", id: 0 }]
              },
              {
                name: "kanto",
                items: [
                  { name: "東京都", id: 12 },
                  { name: "千葉県", id: 11 },
                  { name: "群馬県", id: 9 },
                  { name: "埼玉県", id: 10 },
                  { name: "栃木県", id: 8 }
                ]
              },
              {
                name: "chubu",
                items: [
                  { name: "愛知県", id: 22 },
                  { name: "静岡県", id: 21 },
                  { name: "山梨県", id: 18 }
                ]
              },
              {
                name: "hokuriku",
                items: [
                  { name: "新潟県", id: 14 },
                  { name: "富山県", id: 15 },
                  { name: "福井県", id: 17 }
                ]
              },
              {
                name: "kansai",
                items: [
                  { name: "京都府", id: 25 },
                  { name: "大阪府", id: 26 },
                  { name: "兵庫県", id: 27 }
                  // { name: "奈良県", id: 28 },
                ]
              },
              {
                name: "chugoku",
                items: [
                  { name: "広島県", id: 33 },
                  { name: "愛媛県", id: 37 }
                ]
              },
              {
                name: "kyusyu",
                items: [
                  { name: "福岡県", id: 39 },
                  { name: "長崎県", id: 41 },
                  { name: "大分県", id: 43 }
                ]
              }
            ]
          : [
              {
                name: "USA",
                items: [{ name: "Washington", id: 46 }]
              }
            ]
    };
  },
  head() {
    const title = [
      this.$t("pageTitle.restaurantRoot"),
      ownPlateConfig.siteName
    ].join(" / ");
    return Object.assign(RestaurantHeader, { title });
  },
  async mounted() {
    if (this.isUser) {
      const snapshot = await db
        .collection(`users/${this.user.uid}/reviews`)
        .orderBy("timeLiked", "desc")
        .limit(100)
        .get();
      this.likes = (snapshot.docs || [])
        .map(doc => {
          return doc.data();
        })
        .filter(doc => {
          return !!doc.likes;
        });
    }
  }
  // # Need to rewrite for Areas instead of Restaurants.
  /*
  async created() {
    try {
      const res = await db
        .collection("restaurants")
        .where("publicFlag", "==", true)
        .where("deletedFlag", "==", false)
        .get();
      this.restaurants = (res.docs || []).map(doc => {
        const data = doc.data();
        data.id = doc.id;
        return data;
      });
      console.log(this.restaurants.length, this.restaurants);
    } catch (error) {
      console.log(error);
    }
  }
*/
};
</script>
