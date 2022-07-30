<template>
  <div class="mx-6 mt-6 lg:max-w-2xl lg:mx-auto">
    <!-- Title -->
    <div class="text-xl font-bold text-black text-opacity-30">
      {{ $t("profile.address") }}
    </div>

    <!-- Card -->
    <div class="bg-white rounded-lg shadow mt-2 p-6">
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
        <b-button @click="resetAddress" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
            style="min-width: 288px"
          >
            <div class="text-xl font-bold text-white">
              {{ $t("profile.resetAddress") }}
            </div>
          </div>
        </b-button>
      </div>
      <div class="text-center mt-2 font-bold">
        * {{ $t("profile.resetAddressMessage") }}
      </div>
      <div class="text-center font-bold">
        {{ $t("profile.resetAddressModify") }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from "@vue/composition-api";
import { db } from "@/plugins/firebase";
import { useBasePath } from "@/utils/utils";

export default defineComponent({
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
      db.doc(docPath.value)
        .get()
        .then((doc) => {
          customerInfo.value = doc.data();
        });
    }
    const resetAddress = async () => {
      await db.doc(docPath.value).set({});
      customerInfo.value = {};
    };

    return {
      customerInfo,
      resetAddress,
    };
  },
});
</script>
