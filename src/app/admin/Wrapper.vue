<template>
<div>
  <div v-if="groupData===undefined"/>
  <router-view v-else />
</div>
</template>
  
<script lang="ts">
import {
  defineComponent,
  ref,
} from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, DocumentData } from "firebase/firestore";

export default defineComponent({
  setup(_, ctx) {
    const groupData = ref();

    if (true) {
      getDoc(doc(db, "/groups/ss")).then((a) => {
        groupData.value = a.exists() ? a.data() : null;
        console.log(groupData.value);
      });
                                        
    }
    return {
      groupData
    };
  }
});
</script>
