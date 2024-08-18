<template>
  <div>
    <div class="mx-6 mt-2">
      <back-button
        :url="basePath + '/u/profile/'"
        backText="button.myPage"
        iconText="arrow_back"
      />
    </div>

    <div class="mx-6 mt-4 text-xl font-bold text-black text-opacity-40">
      {{ $t("find.likes") }}
    </div>

    <!-- Likes -->
    <div>
      <div v-if="likes === null" />
      <div v-else-if="likes.length === 0">
        <div
          class="mx-6 mt-2 rounded-xl border-2 border-dashed border-black border-opacity-10 p-4 text-center"
        >
          <span class="text-base text-black text-opacity-40">
            {{ $t("find.noLikes") }}</span
          >
        </div>
      </div>
      <div v-else>
        <div
          class="mx-6 mt-2 grid grid-cols-1 items-center gap-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div v-for="like in likes" :key="like.restaurantId">
            <router-link :to="basePath + `/r/${like.restaurantId}`">
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

    <div class="mx-6 mt-4" v-if="mode === 'normal'">
      <router-link :to="'/r'">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">list</i>
          <span class="text-sm font-bold text-op-teal">{{
            $t("find.areaTop")
          }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
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
import { ownPlateConfig } from "@/config/project";
import {
  routeMode,
  useBasePath,
  useUserData,
  resizedProfileImage,
} from "@/utils/utils";

// import AreaItem from "@/app/user/Restaurants/AreaItem.vue";
import BackButton from "@/components/BackButton.vue";

import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    // AreaItem,
    BackButton,
  },
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const basePath = useBasePath();
    const likes = ref<DocumentData[] | null>(null);

    const { uid, isUser } = useUserData();

    const mode = routeMode();

    const path = computed(() => {
      return `users/${uid.value}/reviews`;
    });

    const title = [t("pageTitle.restaurantRoot"), ownPlateConfig.siteName].join(
      " / ",
    );
    useHead(Object.assign(RestaurantHeader, { title }));

    if (isUser.value) {
      (async () => {
        const snapshot = await getDocs(
          query(
            collection(db, path.value),
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
      })();
    } else {
      router.push(basePath.value + "/u/profile");
    }
    return {
      likes,
      basePath,

      mode,
      resizedProfileImage,
    };
  },
});
</script>
