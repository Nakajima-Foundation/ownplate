<template>
  <!-- Mail Magazine -->
  <div class="mt-4">
    <div class="mb-2 text-xl font-bold text-black/40">
      {{ $t("admin.mail.magazine.title") }}
    </div>

    <div class="rounded-lg bg-white p-4 shadow-sm">
      <div class="text-base text-black/60">
        {{ $t("admin.mail.magazine.body") }}
      </div>

      <div class="mt-4 text-center font-bold text-black/60">
        <Checkbox v-model="opt_out">
          {{ $t("admin.mail.magazine.optout") }}
        </Checkbox>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUserStore } from "@/store/user";

import Checkbox from "@/components/form/checkbox.vue";

export default defineComponent({
  components: {
    Checkbox,
  },
  setup() {
    const userStore = useUserStore();

    const opt_out = ref(false);
    const ownerUid = computed(() => {
      return userStore.isSubAccount
        ? userStore.parentId
        : userStore.uidAdmin;
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
        { merge: true },
      );
    });

    return {
      opt_out,
    };
  },
});
</script>
