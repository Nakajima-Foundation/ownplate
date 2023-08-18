<template>
  <div v-if="notFound">
    <not-found />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
} from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc } from "firebase/firestore";
import NotFound from "@/components/NotFound.vue";

import { useRoute } from "vue-router";

export default defineComponent({
  name: "LinkPage",
  components: {
    NotFound,
  },
  setup() {
    const notFound = ref(false);
    const route = useRoute();
    const key = route.params.urlKey;

    getDoc(doc(db, `/link/${key}`)).then((admin) => {
      if (admin && admin.data()) {
        // TODO: record access log.
        window.location.href = admin.data()?.url;
      } else {
        notFound.value = true;
      }
    });
    return {
      notFound,
    };
  },
});
</script>
