<template>
  <div>
    <section class="mx-auto max-w-full px-6 pb-12 pt-4">
      <back-button :url="backUrl" />
    </section>
    <div v-if="restaurantData === null">loading</div>
    <div v-else class="mx-8">
      <div>
        {{ restaurantData.restaurantName }}
      </div>
      <div>
        <button @click="phone" class="mt-4 h-9 rounded-full bg-green-400 px-4">
          phone
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { superTwilio } from "@/lib/firebase/functions";

import BackButton from "@/components/BackButton.vue";

import { db } from "@/lib/firebase/firebase9";
import { getDoc, doc } from "firebase/firestore";

import { superPermissionCheck, getBackUrl, defaultTitle } from "@/utils/utils";
import { useRoute } from "vue-router";

export default defineComponent({
  metaInfo() {
    return {
      title: [defaultTitle, "Super All Restaurants"].join(" / "),
    };
  },
  components: {
    BackButton,
  },
  setup() {
    const route = useRoute();
    const restaurantId = route.params.restaurantId;
    superPermissionCheck();

    const restaurantData = ref<any>({});
    getDoc(doc(db, `restaurants/${restaurantId}`)).then((restaurantDoc) => {
      restaurantData.value = restaurantDoc.data();
    });

    const phone = async () => {
      if (confirm("ok")) {
        await superTwilio({ restaurantId: restaurantId });
      }
    };
    return {
      restaurantData,
      phone,
      backUrl: getBackUrl(),
    };
  },
});
</script>
