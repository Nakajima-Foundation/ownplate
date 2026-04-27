<template>
  <div>
    <!-- View All -->
    <div>
      <div class="mx-6 mt-4 text-xl font-bold text-black/40">
        {{ $t("find.area") }}
      </div>
      <div
        class="mx-6 mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <area-item :name="$t('find.areaAll')" :id="'all'" />
      </div>
    </div>

    <!-- Areas -->
    <div v-for="(area, k) in areas" :key="k">
      <div class="mx-6 mt-4 text-base font-bold text-black/40">
        {{ $t("find.areas." + area.name) }}
      </div>
      <div
        class="mx-6 mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <area-item
          v-for="item in area.items"
          :name="$t('find.prefecture.' + item.key)"
          :id="String(item.id)"
          :key="item.id"
        />
      </div>
    </div>

    <!-- Likes -->
    <div v-if="likes.length > 0">
      <div class="mx-6 mt-4 text-xl font-bold text-black/40">
        {{ $t("find.likes") }}
      </div>
      <div
        class="mx-6 mt-2 grid grid-cols-1 items-center gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div v-for="like in likes" :key="like.restaurantId">
          <router-link :to="`/r/${like.restaurantId}`">
            <div class="flex items-center">
              <div class="mr-4 h-12 w-12 rounded-full bg-black/10">
                <img
                  :src="resizedProfileImage(like, '600')"
                  class="h-12 w-12 rounded-full object-cover"
                />
              </div>
              <div class="flex-1 pr-2 text-base font-bold">
                {{ like.restaurantName }}
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

import { db } from "@/lib/firebase/firebase9";
import {
  getDocs,
  collection,
  orderBy,
  limit,
  query,
  DocumentData,
} from "firebase/firestore";

import { RestaurantHeader } from "@/config/header";
import AreaItem from "@/app/user/Restaurants/AreaItem.vue";
import { ownPlateConfig } from "@/config/project";

import { useUserData, resizedProfileImage } from "@/utils/utils";
import { useHead } from "@unhead/vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    AreaItem,
  },
  setup() {
    const { isUser, uid } = useUserData();

    const { t } = useI18n();
    const title = [t("pageTitle.restaurantRoot"), ownPlateConfig.siteName].join(
      " / ",
    );
    useHead(Object.assign(RestaurantHeader, { title }));

    const likes = ref<DocumentData[]>([]);
    onMounted(async () => {
      if (isUser.value) {
        const snapshot = await getDocs(
          query(
            collection(db, `users/${uid.value}/reviews`),
            orderBy("timeLiked", "desc"),
            limit(100),
          ),
        );

        likes.value = (snapshot.docs || [])
          .map((doc) => {
            return doc.data();
          })
          .filter((doc) => {
            return !!doc.likes;
          });
      }
    });

    return {
      resizedProfileImage,
      likes,
      areas: [
        {
          name: "hokkaido",
          items: [{ key: "hokkaido", id: 0 }],
        },
        {
          name: "tohoku",
          items: [
            { key: "miyagi", id: 3 },
            { key: "akita", id: 4 },
          ],
        },
        {
          name: "kanto",
          items: [
            { key: "tokyo", id: 12 },
            { key: "kanagawa", id: 13 },
            { key: "chiba", id: 11 },
            { key: "gunma", id: 9 },
            { key: "saitama", id: 10 },
            { key: "tochigi", id: 8 },
            { key: "ibaraki", id: 7 },
          ],
        },
        {
          name: "chubu",
          items: [
            { key: "aichi", id: 22 },
            { key: "shizuoka", id: 21 },
            { key: "yamanashi", id: 18 },
            { key: "nagano", id: 19 },
            { key: "gifu", id: 20 },
          ],
        },
        {
          name: "hokuriku",
          items: [
            { key: "niigata", id: 14 },
            { key: "toyama", id: 15 },
            { key: "ishikawa", id: 16 },
            { key: "fukui", id: 17 },
          ],
        },
        {
          name: "kansai",
          items: [
            { key: "kyoto", id: 25 },
            { key: "osaka", id: 26 },
            { key: "hyogo", id: 27 },
            { key: "shiga", id: 24 },
            { key: "wakayama", id: 29 },
            // { key: "nara", id: 28 },
          ],
        },
        {
          name: "chugoku",
          items: [
            { key: "hiroshima", id: 33 },
            { key: "yamaguchi", id: 34 },
            { key: "tokushima", id: 35 },
            { key: "ehime", id: 37 },
          ],
        },
        {
          name: "kyusyu",
          items: [
            { key: "fukuoka", id: 39 },
            { key: "nagasaki", id: 41 },
            { key: "oita", id: 43 },
            { key: "kagoshima", id: 45 },
            { key: "okinawa", id: 46 },
          ],
        },
      ],
    };
  },
});
</script>
