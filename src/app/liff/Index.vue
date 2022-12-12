<template>
  <div>
    <div class="mx-6 mt-6 text-xl font-bold text-black text-opacity-40">
      {{ $t("find.areaAll") }}
    </div>
    <!-- Restaurants -->
    <div
      class="mx-6 mt-2 grid grid-cols-1 items-center gap-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div v-for="(restaurant, k) in restaurants">
        <router-link :to="`/liff/${liffIndexId}/r/${restaurant.id}`">
          <div class="flex items-center">
            <div class="mr-4 h-12 w-12 rounded-full bg-black bg-opacity-10">
              <img
                :src="resizedProfileImage(restaurant, '600')"
                class="h-12 w-12 rounded-full object-cover"
              />
            </div>
            <div class="flex-1 pr-2 text-base font-bold">
              {{ restaurant.restaurantName }}
              <i
                class="material-icons align-middle"
                v-if="restaurant.enableDelivery"
              >
                delivery_dining
              </i>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import firebase from "firebase/compat/app";
import { DocumentData } from "firebase/firestore";

import { defineComponent, ref } from "@vue/composition-api";

import { db } from "@/plugins/firebase";

export default defineComponent({
  props: {
    config: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const restaurants = ref<DocumentData[]>([]);

    db.collection("restaurants")
      .where(
        firebase.firestore.FieldPath.documentId(),
        "in",
        props.config.restaurants || []
      )
      .get()
      .then((collect) => {
        const r = collect.docs.map((a) => {
          const data = a.data();
          data.id = a.id;
          return data;
        });
        restaurants.value = r;
      });
    return {
      restaurants,
    };
  },
});
</script>
