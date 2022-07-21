<template>
  <div>
    <div class="mt-6 mx-6">
      <back-button :url="basePath + '/u/profile/'" />
    </div>

    <div class="text-xl font-bold text-black text-opacity-40 mt-6 mx-6">
      {{ $t( isInMo ? "find.favoriteShop" :"find.likes") }}
    </div>

    <!-- Likes -->
    <div>
      <div v-if="likes === null" />
      <div v-else-if="likes.length === 0">
        <div
          class="mt-2 mx-6 border-2 border-dashed border-black border-opacity-10 p-4 text-center rounded-xl"
        >
          <span class="text-base text-black text-opacity-40">
            {{ $t( isInMo ? "find.nofavoriteShop" : "find.noLikes") }}</span
          >
        </div>
      </div>
      <div v-else>
        <div
          class="mt-2 mx-6 grid items-center grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div v-for="like in likes" :key="like.restaurantId">
            <router-link :to="basePath + `/r/${like.restaurantId}`">
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

    <div class="mt-6 mx-6" v-if="mode === 'normal'">
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
import { defineComponent, ref, computed } from "@vue/composition-api";
import { db } from "@/plugins/firebase";
import { RestaurantHeader } from "@/config/header";
import AreaItem from "@/app/user/Restaurants/AreaItem";
import { ownPlateConfig } from "@/config/project";
import BackButton from "@/components/BackButton";
import { useIsInMo, useMoPrefix, routeMode, useBasePath } from "@/utils/utils";

export default defineComponent({
  components: {
    AreaItem,
    BackButton,
  },
  metaInfo(root) {
    const title = [
      root.$t("pageTitle.restaurantRoot"),
      ownPlateConfig.siteName,
    ].join(" / ");
    return Object.assign(RestaurantHeader, { title });
  },
  setup(props, ctx) {
    const basePath = useBasePath(ctx.root);
    const likes = ref(null);

    const isInMo = useIsInMo(ctx.root);
    const moPrefix = useMoPrefix(ctx.root);

    const mode = routeMode(ctx.root);

    const path = computed(() => {
      if (isInMo.value) {
        return `users/${ctx.root.user.uid}/groups/${moPrefix.value}/reviews`;
      } else {
        return `users/${ctx.root.user.uid}/reviews`;
      }
    });

    if (ctx.root.isUser) {
      (async () => {
        const snapshot = await db
          .collection(path.value)
          .orderBy("timeLiked", "desc")
          .limit(100)
          .get();
        likes.value = (snapshot.docs || [])
          .map((doc) => {
            return doc.data();
          })
          .filter((doc) => {
            return !!doc.likes;
          });
      })();
    } else {
      ctx.root.$router.push(basePath.value + "/u/profile");
    }
    return {
      likes,
      basePath,

      isInMo,
      mode,
    };
  },
});
</script>
