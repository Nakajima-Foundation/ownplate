<template>
  <section class="mx-auto max-w-full px-6 pb-12 pt-4">
    <back-button url="/s" />
    <h2>All Callbacks</h2>
    <div v-for="log in logs" :key="log.id">
      <router-link :to="`/s/callbacks/${log.uid}/${log.id}`">
        {{ moment(log.created.toDate()).format("YYYY-MM-DD HH:mm") }}/{{
          log.uid || log.data.uid
        }}/{{ stripeActionStrings[log.action] }}
      </router-link>
    </div>
    <button @click="nextLoad">next</button>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BackButton from "@/components/BackButton.vue";
import { db } from "@/lib/firebase/firebase9";
import {
  query,
  limit,
  orderBy,
  startAfter,
  getDocs,
  collectionGroup,
} from "firebase/firestore";

import { stripeActionStrings } from "@/lib/stripe/stripe";
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
    const last = ref<any>(null);

    useHead(() => ({
      title: [defaultTitle, "Super All Stripe Callback"].join(" / "),
    }));

    getDocs(
      query(
        collectionGroup(db, "stripeLogs"),
        orderBy("created", "desc"),
        limit(100),
      ),
    ).then((snapshot) => {
      logs.value = snapshot.docs.map((doc) => {
        last.value = doc;
        const log = doc.data();
        log.id = doc.id;
        return log;
      });
    });

    const nextLoad = async () => {
      const nextData = await getDocs(
        query(
          collectionGroup(db, "stripeLogs"),
          orderBy("created", "desc"),
          startAfter(last.value),
          limit(100),
        ),
      );

      if (!nextData.empty) {
        nextData.docs.forEach((doc) => {
          last.value = doc;
          const log = doc.data();
          log.id = doc.id;
          logs.value.push(log);
        });
      }
    };

    return {
      stripeActionStrings,
      logs,
      last,
      nextLoad,
      moment,
    };
  },
});
</script>
