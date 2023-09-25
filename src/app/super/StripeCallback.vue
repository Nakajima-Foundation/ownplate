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
import { defineComponent, ref } from "vue";
import BackButton from "@/components/BackButton.vue";
import { stripeActionStrings } from "@/lib/stripe/stripe";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc } from "firebase/firestore";

import { useSuper } from "@/utils/utils";
import { useRoute } from "vue-router";
import moment from "moment";

export default defineComponent({
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Stripe Callback"].join(" / "),
    };
  },
  components: {
    BackButton,
  },
  setup() {
    useSuper();
    const route = useRoute();

    const log = ref<any>(null);

    const logUid = route.params.uid;
    const logId = route.params.logId;
    getDoc(doc(db, `admins/${logUid}/stripeLogs/${logId}`)).then((doc) => {
      log.value = doc.data();
    });
    return {
      stripeActionStrings,
      log,
      moment,
    };
  },
});
</script>
