<template>
  <!-- Mail Magazine -->
  <div class="mt-6">
    <div class="text-xl font-bold text-black text-opacity-40 mb-2">
      {{ $t("admin.mail.magazine.title") }}
    </div>

    <div class="bg-white shadow rounded-lg p-4">
      <div class="text-base text-black text-opacity-60">
        {{ $t("admin.mail.magazine.body") }}
      </div>

      <div class="text-center mt-4">
        <b-checkbox v-model="opt_out">
          {{ $t("admin.mail.magazine.optout") }}
        </b-checkbox>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// import firebase from "firebase/compat/app";
import { DocumentData } from "firebase/firestore";

import { defineComponent, ref, computed, watch } from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default defineComponent({
  setup(_, ctx) {
    const opt_out = ref(false);
    const ownerUid = computed(() => {
      return ctx.root.$store.getters.isSubAccount
        ? ctx.root.$store.getters.parentId
        : ctx.root.$store.getters.uidAdmin;
    });

    (async () => {
      const adminConfig =
        (await getDoc(doc(db, `/adminConfigs/${ownerUid.value}`))).data() || {};
      opt_out.value = adminConfig.opt_out || false;
    })();

    watch(opt_out, (current) => {
      updateDoc(doc(db, `/adminConfigs/${ownerUid.value}`), {
        opt_out: opt_out.value,
      });
    });

    return {
      opt_out,
    };
  },
});
</script>
