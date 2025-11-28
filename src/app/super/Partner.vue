<template>
  <section class="mx-auto max-w-full px-6 pt-4 pb-12">
    <back-button url="/s" />

    <div v-for="(admin, k) in admins" :key="k">
      <router-link :to="`/s/admins/${admin.id}`">{{ admin.name }}</router-link>
      {{ admin.partners }} {{ admin?.created?.toDate() }}
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BackButton from "@/components/BackButton.vue";
import { db } from "@/lib/firebase/firebase9";
import {
  getDocs,
  query,
  collection,
  where,
  limit,
  DocumentData,
} from "firebase/firestore";
import { useHead } from "@unhead/vue";

import { useSuper, defaultTitle } from "@/utils/utils";

export default defineComponent({
  components: {
    BackButton,
  },
  setup() {
    useSuper();

    useHead(() => ({
      title: [defaultTitle, "Super Partners"].join(" / "),
    }));

    const admins = ref<DocumentData[]>([]);

    getDocs(
      query(
        collection(db, "admins"),
        where("partners", "!=", null),
        limit(200),
      ),
    ).then((adminCollections) => {
      admins.value = adminCollections.docs
        .map((admin) => {
          const data = admin.data();
          data.id = admin.id;
          return data;
        })
        .sort((a, b) => {
          console.log(a, b);
          return (a?.created?.toDate() || new Date()).getTime() <
            (b?.created?.toDate() || new Date()).getTime()
            ? 1
            : -1;
        });
    });

    return {
      admins,
    };
  },
});
</script>
