<template>
  <div>
    <div class="mt-6 mx-6">
      <back-button url="/u/profile/" />
    </div>

    <div class="text-xl font-bold text-black text-opacity-40 mt-6 mx-6">
      {{ $t("find.likes") }}
    </div>

    <!-- Likes -->
    <div>
      <div v-if="likes === null" />
      <div v-else-if="likes.length === 0">
        <div
          class="mt-2 mx-6 border-2 border-dashed border-black border-opacity-10 p-4 text-center rounded-xl"
        >
          <span class="text-base text-black text-opacity-40">
            {{ $t("find.noLikes") }}</span
          >
        </div>
      </div>
      <div v-else>
        <div
          class="mt-2 mx-6 grid items-center grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div v-for="like in likes" :key="like.restaurantId">
            <router-link :to="`/r/${like.restaurantId}`">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-black bg-opacity-10 mr-4">
                  <img
                    :src="resizedProfileImage(like, '600')"
                    class="w-12 h-12 rounded-full object-cover"
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

    <div class="mt-6 mx-6">
      <router-link :to="'/r'">
        <div
          class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons text-lg text-op-teal mr-2">list</i>
          <span class="text-sm font-bold text-op-teal">{{
            $t("find.areaTop")
          }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import { RestaurantHeader } from "~/plugins/header.js";
import AreaItem from "~/app/user/Restaurants/AreaItem";
import { ownPlateConfig } from "@/config/project";
import BackButton from "~/components/BackButton";

export default {
  components: {
    AreaItem,
    BackButton
  },
  data() {
    return {
      likes: null,
      restaurants: []
    };
  },
  metaInfo() {
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
};
</script>
