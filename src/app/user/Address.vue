<template>
  <div>
    <div class="mx-6 mt-6">
      <back-button :url="basePath + '/u/profile/'" />
    </div>

    <div class="mx-6 mt-6 lg:mx-auto lg:max-w-2xl">
      <!-- Title -->
      <div class="text-xl font-bold text-black text-opacity-30">
        {{ $t("profile.address") }}
      </div>

      <!-- Card -->
      <div class="mt-2 rounded-lg bg-white p-6 shadow">
        <div class="text-sm font-bold">
          {{ $t("order.ec.zip") }}
        </div>
        <div class="mt-1 mb-2">
          {{ customerInfo.zip || "----" }}
        </div>
        <!-- address -->
        <div class="text-sm font-bold">
          {{ $t("order.ec.address") }}
        </div>
        <div class="mt-1 mb-2">
          {{ customerInfo.prefecture }}
          {{ customerInfo.address || "----" }}
        </div>
        <div class="text-sm font-bold">
          {{ $t("order.ec.name") }}
        </div>
        <div class="mt-1 mb-2">
          {{ customerInfo.name || "----" }}
        </div>
        <div class="text-center">
          <o-button @click="resetAddress" class="b-reset-tw">
            <div
              class="inline-flex h-16 items-center justify-center rounded-full bg-op-teal px-6 shadow"
              style="min-width: 288px"
            >
              <div class="text-xl font-bold text-white">
                {{ $t("profile.resetAddress") }}
              </div>
            </div>
          </o-button>
        </div>
        <div class="mt-2 text-center font-bold">
          * {{ $t("profile.resetAddressMessage") }}
        </div>
        <div class="text-center font-bold">
          {{ $t("profile.resetAddressModify") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { useBasePath } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";

export default defineComponent({
  components: {
    BackButton,
  },
  setup(_, ctx) {
    const basePath = useBasePath(ctx.root);
    const customerInfo = ref({});

    const docPath = computed(() => {
      if (ctx.root.isUser) {
        return `/users/${ctx.root.user.uid}/address/data`;
      }
      return null;
    });

    if (!ctx.root.isUser) {
      ctx.root.$router.push(basePath.value + "/u/profile");
    }

    if (docPath.value) {
      getDoc(doc(db, docPath.value)).then((doc) => {
        customerInfo.value = doc.data() || {};
      });
    }
    const resetAddress = async () => {
      await setDoc(doc(db, docPath.value), {});
      customerInfo.value = {};
    };

    return {
      customerInfo,
      resetAddress,
      basePath,
    };
  },
});
</script>
