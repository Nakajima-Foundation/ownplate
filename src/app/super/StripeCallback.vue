<template>
  <section class="mx-auto max-w-full px-6 pb-12 pt-4">
    <back-button url="/s" />
    <h2>Callback</h2>
    <div v-if="log">
      {{ moment(log.created.toDate()).format("YYYY-MM-DD hh:mm") }}/{{
        log.uid || log.data.uid
      }}/{{ stripeActionStrings[log.action] }}
      <pre>{{ log.data }}</pre>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import BackButton from "@/components/BackButton.vue";
import { db } from "@/plugins/firebase";
import { stripeActionStrings } from "@/lib/stripe/stripe";

import { useSuper } from "@/utils/utils";
import { useRoute } from "vue-router";

export default defineComponent({
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Stripe Callback"].join(" / "),
    };
  },
  components: {
    BackButton,
  },
  setup () {
    useSuper();
    const route = useRoute();
    
    const log = ref<any>(null);

    const logUid =  route.params.uid;
    const logId = route.params.logId;
    db.doc(`admins/${logUid}/stripeLogs/${logId}`).get().then((doc) => {
      log.value = doc.data();
    });
    return {
      stripeActionStrings,
      log,
    }
  },
});
</script>
