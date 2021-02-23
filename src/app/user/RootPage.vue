<template>
  <div>
    <!-- List Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <!-- Title -->
          <div class="t-h6 c-text-black-disabled m-t-24">
            {{ $t("find.area") }}
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>

    <!-- List Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-16 m-t-16">
          <!-- Areas -->
          <div class="columns is-gapless is-multiline">
            <area-item :name="$t('find.areaAll')" :id="'all'" />
          </div>
        </div>
      </div>
    </div>

    <template v-for="area in areas">
      <!-- List Header Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-24 m-t-24">
            <!-- Title -->
            <div class="t-h6 c-text-black-disabled m-t-24">
              {{ $t("find.areas." + area.name) }}
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>

      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-16 m-t-16">
            <!-- Areas -->
            <div class="columns is-gapless is-multiline">
              <!-- v-for="area in areas" -->
              <area-item
                v-for="item in area.items"
                :name="item.name"
                :id="String(item.id)"
                :key="item.id"
              />
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>
    </template>

    <!-- Likes Header Area -->
    <div class="columns is-gapless" v-if="likes.length > 0">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <!-- Title -->
          <div class="t-h6 c-text-black-disabled m-t-24">
            {{ $t("find.likes") }}
          </div>
          <div v-for="like in likes" :key="like.restaurantId" class="m-t-8">
            <div class="h-full p-b-8 p-r-8">
              <router-link :to="`/r/${like.restaurantId}`">
                <div class="touchable h-full">
                  <div class="cols flex-center">
                    <!-- Restaurant Profile -->
                    <div class="m-r-16 h-48">
                      <img
                        :src="resizedProfileImage(like, '600')"
                        class="w-12 h-12 r-48 cover"
                      />
                    </div>

                    <!-- Restaurant Name -->
                    <div class="flex-1 p-r-8 t-subtitle1 c-primary">
                      {{ like.restaurantName }}
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
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
                  { name: "長崎県", id: 41 }
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
