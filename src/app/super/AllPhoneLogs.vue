<template>
  <section class="mx-auto max-w-full px-6 pb-12 pt-4">
    <back-button url="/s" />
    <h2>All Logs</h2>
    <table>
      <tr v-for="log in logs" :key="log.id">
        <td class="pb-2">
          {{
            moment(log.updatedAt.toDate()).format("YYYY:MM:DD HH:mm")
          }}/<router-link :to="`/r/${log.restaurantId}`">{{
            log.restaurantId
          }}</router-link
          >/{{ log.orderId }}
        </td>
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
import moment from "moment-timezone";

export default defineComponent({
  components: {
    BackButton,
  },
  setup() {
    useSuper();

    const logs = ref<any[]>([]);
    let detacher: any = null;

    useHead({
      title: [defaultTitle, "Super All Phone Logs"].join(" / "),
    });

    detacher = onSnapshot(
      query(
        collectionGroup(db, "phoneLog"),
        orderBy("updatedAt", "desc"),
        limit(100),
      ),
      (snapshot) => {
        logs.value = snapshot.docs.map((doc) => {
          const log = doc.data();
          log.id = doc.id;
          log.createdAt = log.updatedAt.toDate();
          return log;
        });
      },
    );

    onUnmounted(() => {
      detacher && detacher();
    });

    return {
      logs,
      moment,
    };
  },
});
</script>
