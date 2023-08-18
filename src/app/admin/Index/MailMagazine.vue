<template>
  <!-- Mail Magazine -->
  <div class="mt-6">
    <div class="mb-2 text-xl font-bold text-black text-opacity-40">
      {{ $t("admin.mail.magazine.title") }}
    </div>

    <div class="rounded-lg bg-white p-4 shadow">
      <div class="text-base text-black text-opacity-60">
        {{ $t("admin.mail.magazine.body") }}
      </div>

      <div class="mt-4 text-center font-bold text-black text-opacity-60">
        <o-checkbox v-model="opt_out">
          {{ $t("admin.mail.magazine.optout") }}
        </o-checkbox>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();
    
    const opt_out = ref(false);
    const ownerUid = computed(() => {
      return store.getters.isSubAccount
        ? store.getters.parentId
        : store.getters.uidAdmin;
    });

    (async () => {
      const adminConfig =
        (await getDoc(doc(db, `/adminConfigs/${ownerUid.value}`))).data() || {};
      opt_out.value = adminConfig.opt_out || false;
    })();

    watch(opt_out, () => {
      console.log(opt_out);
      setDoc(
        doc(db, `/adminConfigs/${ownerUid.value}`),
        { opt_out: opt_out.value },
        { merge: true }
      );
    });

    return {
      opt_out,
    };
  },
});
</script>
