<template>
  <section class="mx-auto max-w-full px-6 pt-4 pb-12">
    <back-button url="/s" />
    <h2>All Logs</h2>
    <table>
      <tr v-for="log in logs" :key="log.id">
        <td class="pb-2">
          {{ log.cmd }}
          <div class="ml-2">{{ log.key }} {{ log.value }}</div>
        </td>
        <td class="pl-2">{{ log.success ? "success" : log.error }}</td>
        <td class="pl-2">
          <router-link :to="`/s/admins/${log.uid}`">{{
            log.email || log.uid
          }}</router-link>
        </td>
        <td class="pl-2">{{ log.uidSuper.slice(0, 8) + "..." }}</td>
      </tr>
    </table>
  </section>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from "vue";
import BackButton from "@/components/BackButton.vue";
import { db } from "@/lib/firebase/firebase9";
import {
  onSnapshot,
  query,
  collectionGroup,
  orderBy,
  limit,
} from "firebase/firestore";

import { useSuper, defaultTitle } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  components: {
    BackButton,
  },
  setup() {
    useSuper();

    useHead(() => ({
      title: [defaultTitle, "Super All Log"].join(" / "),
    }));

    const logs = ref<any[]>([]);
    let detacher: any = null;

    detacher = onSnapshot(
      query(
        collectionGroup(db, "adminlogs"),
        orderBy("createdAt", "desc"),
        limit(100),
      ),
      (snapshot) => {
        logs.value = snapshot.docs.map((doc) => {
          const log = doc.data();
          log.id = doc.id;
          log.createdAt = log.createdAt.toDate();
          return log;
        });
      },
    );

    onUnmounted(() => {
      detacher && detacher();
    });

    return {
      logs,
    };
  },
});
</script>
