<template>
<div>
  <div v-if="groupData === null">
  </div>
  <div v-else-if="groupData === false">
    <NotFound />
  </div>
  <router-view
    v-else
    :moPrefix="moPrefix"
    :moBasePath="moBasePath"
    />
</div>
</template>

<script>
import { defineComponent, ref, computed } from "@vue/composition-api";

import NotFound from "@/components/NotFound";

import { useMoPrefix } from "@/utils/utils";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDoc,
} from "firebase/firestore";

export default defineComponent({
  components: {
    NotFound
  },
  setup(_, ctx) {
    const moPrefix = useMoPrefix(ctx.root);
    const moBasePath = computed(() => {
      return "/" + moPrefix.value;
    });

    const groupData = ref(null);
    getDoc(doc(db, `/groups/${moPrefix.value}`)).then((a) => {
      if (a.exists()) {
        groupData.value = a.data();
      } else {
        groupData.value = false;
      }
      
    });
    return {
      moPrefix,
      moBasePath,
      groupData,
    };
  }
});
</script>
