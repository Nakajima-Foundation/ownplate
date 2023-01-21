<template>
  <div>
    <div v-if="groupData === null"></div>
    <div v-else-if="groupData === false">
      <NotFound />
    </div>
    <div v-else-if="isOutage">
      <Outage />
    </div>
    <router-view
      v-else
      :moPrefix="moPrefix"
      :moBasePath="moBasePath"
      :groupData="groupData"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";

import NotFound from "@/components/NotFound.vue";
import Outage from "@/app/user/Outage.vue";

import { useMoPrefix } from "@/utils/utils";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc } from "firebase/firestore";

export default defineComponent({
  components: {
    NotFound,
    Outage,
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
    const isOutage = computed(() => {
      return groupData.value && groupData.value.isOutage;
    });
    return {
      moPrefix,
      moBasePath,
      groupData,
      isOutage,
    };
  },
});
</script>
