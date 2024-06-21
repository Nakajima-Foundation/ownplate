<template>
  <div>
    <!-- View All -->
    <div>
      <div class="mx-6 mt-4 text-xl font-bold text-black text-opacity-40">
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
      <div class="mx-6 mt-4 text-base font-bold text-black text-opacity-40">
        {{ $t("find.areas." + area.name) }}
      </div>
      <div
        class="mx-6 mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
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
      <div class="mx-6 mt-4 text-xl font-bold text-black text-opacity-40">
        {{ $t("find.likes") }}
      </div>
      <div
        class="mx-6 mt-2 grid grid-cols-1 items-center gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div v-for="like in likes" :key="like.restaurantId">
          <router-link :to="`/r/${like.restaurantId}`">
            <div class="flex items-center">
              <div class="mr-4 h-12 w-12 rounded-full bg-black bg-opacity-10">
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
import { getDocs, collection, orderBy, limit, query } from "firebase/firestore";

import { RestaurantHeader } from "@/config/header";
import AreaItem from "@/app/user/Restaurants/AreaItem.vue";
import { ownPlateConfig } from "@/config/project";

import { useUserData, resizedProfileImage } from "@/utils/utils";

export default defineComponent({
  components: {
    AreaItem,
  },
  metaInfo() {
    const title = [
      this.$t("pageTitle.restaurantRoot"),
      ownPlateConfig.siteName,
    ].join(" / ");
    return Object.assign(RestaurantHeader, { title }) as any;
  },
  setup() {
    const { isUser, uid } = useUserData();

    const likes = ref<any[]>([]);
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
          items: [{ name: "北海道", id: 0 }],
        },
        {
          name: "tohoku",
          items: [
            { name: "宮城県", id: 3 },
            { name: "秋田県", id: 4 },
          ],
        },
        {
          name: "kanto",
          items: [
            { name: "東京都", id: 12 },
            { name: "神奈川県", id: 13 },
            { name: "千葉県", id: 11 },
            { name: "群馬県", id: 9 },
            { name: "埼玉県", id: 10 },
            { name: "栃木県", id: 8 },
            { name: "茨城県", id: 7 },
          ],
        },
        {
          name: "chubu",
          items: [
            { name: "愛知県", id: 22 },
            { name: "静岡県", id: 21 },
            { name: "山梨県", id: 18 },
            { name: "長野県", id: 19 },
            { name: "岐阜県", id: 20 },
          ],
        },
        {
          name: "hokuriku",
          items: [
            { name: "新潟県", id: 14 },
            { name: "富山県", id: 15 },
            { name: "石川県", id: 16 },
            { name: "福井県", id: 17 },
          ],
        },
        {
          name: "kansai",
          items: [
            { name: "京都府", id: 25 },
            { name: "大阪府", id: 26 },
            { name: "兵庫県", id: 27 },
            { name: "滋賀県", id: 24 },
            { name: "和歌山県", id: 29 },
            // { name: "奈良県", id: 28 },
          ],
        },
        {
          name: "chugoku",
          items: [
            { name: "広島県", id: 33 },
            { name: "山口県", id: 34 },
            { name: "徳島県", id: 35 },
            { name: "愛媛県", id: 37 },
          ],
        },
        {
          name: "kyusyu",
          items: [
            { name: "福岡県", id: 39 },
            { name: "長崎県", id: 41 },
            { name: "大分県", id: 43 },
            { name: "鹿児島県", id: 45 },
            { name: "沖縄県", id: 46 },
          ],
        },
      ],
    };
  },
});
</script>
