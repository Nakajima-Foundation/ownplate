<template>
  <div>
    <!-- Favorites Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Back Button and Restaurant Profile -->
          <div>
            <!-- Back Button -->
            <back-button url="/u/profile/" class="m-t-24" />
            <!-- Title -->
            <div class="t-h6 c-text-black-disabled m-t-24">
              {{ $t("find.likes") }}
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>

    <!-- Favorites Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <div v-if="likes === null" />
          <!-- No Likes -->
          <div v-else-if="likes.length === 0">
            <div class="h-full p-b-8 p-r-8">
              <div
                class="touchable bg-surface r-8 d-low p-l-16 p-r-16 p-t-16 p-b-16 h-full"
              >
                <div class="cols flex-center">
                  No favorite Restaurants
                </div>
              </div>
            </div>
          </div>

          <!-- Likes -->
          <div v-else>
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
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>

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
};
</script>
