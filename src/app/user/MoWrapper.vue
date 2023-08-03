<template>
  <div>
    <div v-if="groupData === null"></div>
    <div v-else-if="groupData === false">
      <NotFound />
    </div>
    <div v-else-if="isOutage">
      <Outage />
    </div>
    <div v-else-if="moCloseStatus === 3">
      <MoClosed />
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
import { defineComponent, ref, computed } from "@vue/composition-api";

import NotFound from "@/components/NotFound.vue";
import Outage from "@/app/user/Outage.vue";
import MoClosed from "@/app/user/Mo/MoClosed.vue";

import { useMoPrefix } from "@/utils/utils";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc } from "firebase/firestore";
import { moCloseStatus } from "@/config/project";

export default defineComponent({
  components: {
    NotFound,
    Outage,
    MoClosed,
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
      moCloseStatus,
    };
  },
});
</script>
