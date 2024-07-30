<template>
  <section class="mx-auto max-w-full px-6 pb-12 pt-4">
    <back-button url="/s" />
    <h2>Profiles</h2>
    <o-input v-model="prefix" placeholder="email prefix"></o-input>
    <o-button @click="handleSearch">Search</o-button>
    <table>
      <tr v-for="profile in profiles" :key="profile.uid">
        <td>{{ profile.email }}</td>
        <td>
          <router-link :to="`/s/admins/${profile.uid}`">{{
            profile.uid
          }}</router-link>
        </td>
      </tr>
    </table>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BackButton from "@/components/BackButton.vue";
import { db } from "@/lib/firebase/firebase9";
import {
  getDocs,
  where,
  query,
  collectionGroup,
  limit,
  DocumentData,
} from "firebase/firestore";

import { useSuper, defaultTitle } from "@/utils/utils";

export default defineComponent({
  metaInfo() {
    return {
      title: [defaultTitle, "Super All Profiles"].join(" / "),
    };
  },
  components: {
    BackButton,
  },
  setup() {
    useSuper();

    const prefix = ref("");
    const profiles = ref<DocumentData[]>([]);

    const handleSearch = () => {
      getDocs(
        query(
          collectionGroup(db, "private"),
          limit(100),
          where("email", ">=", prefix.value),
          where("email", "<=", prefix.value + "\uf8ff"),
        ),
      ).then((snapshot) => {
        profiles.value = snapshot.docs.map((doc) => {
          const data = doc.data();
          data.uid = doc?.ref?.parent?.parent?.id;
          return data;
        });
      });
    };
    return {
      profiles,
      prefix,
      handleSearch,
    };
  },
});
</script>
