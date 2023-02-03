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
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import BackButton from "@/components/BackButton";
import { db } from "@/plugins/firebase";
import { stripeActionStrings } from "@/lib/stripe/stripe";

import { useSuper } from "@/utils/utils";

export default {
  components: {
    BackButton,
  },
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Stripe Callback"].join(" / "),
    };
  },
  setup () {
    useSuper();

    const logs = ref([]);
    let detacher = null;
    const last = ref(null);

    detacher = db
      .collectionGroup("stripeLogs")
      .orderBy("created", "desc")
      .limit(100)
      .onSnapshot((snapshot) => {
        logs.value = snapshot.docs.map((doc) => {
          last.value = doc;
          const log = doc.data();
          log.id = doc.id;
          return log;
        });
      });
    
    const nextLoad = async () => {

      const nextData = await db
        .collectionGroup("stripeLogs")
        .orderBy("created", "desc")
        .startAfter(last.value)
        .limit(100)
        .get();
      if (!nextData.empty) {
        nextData.docs.forEach((doc) => {
          last.value = doc;
          const log = doc.data();
          log.id = doc.id;
          logs.value.push(log);
        });
      }
    };
    
    onUnmounted(() => {
      detacher && detacher();
    });

    return {
      stripeActionStrings,
      logs,
      last,
      nextLoad,
    };
  }
};
</script>
