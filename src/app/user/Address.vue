<template>
  <div>
    <div class="mx-6 mt-4">
      <back-button
        :url="basePath + '/u/profile/'"
        backText="button.myPage"
        iconText="arrow_back"
      />
    </div>

    <div class="mx-6 mt-4 lg:mx-auto lg:max-w-2xl">
      <!-- Title -->
      <div class="text-xl font-bold text-black/30">
        {{ $t("profile.address") }}
      </div>

      <!-- Card -->
      <div class="mt-2 rounded-lg bg-white p-6 shadow-sm">
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
          <t-button
            @click="resetAddress"
            class="h-16 px-12 text-xl font-bold text-white"
          >
            {{ $t("profile.resetAddress") }}
          </t-button>
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

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { useBasePath, useUserData } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";

import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    BackButton,
  },
  setup() {
    const router = useRouter();
    const basePath = useBasePath();
    const customerInfo = ref({});
    const { uid, isUser } = useUserData();

    const docPath = computed(() => {
      if (isUser.value) {
        return `/users/${uid.value}/address/data`;
      }
      return "";
    });

    if (!isUser.value) {
      router.push(basePath.value + "/u/profile");
    }

    if (docPath.value) {
      getDoc(doc(db, docPath.value)).then((_doc) => {
        customerInfo.value = _doc.data() || {};
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
