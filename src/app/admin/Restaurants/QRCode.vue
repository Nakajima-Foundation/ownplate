<template>
  <div>
    <!-- QR Code -->
    <div class="p-2">
      <div class="text-center" @click="download">
        <vue-qrcode
          :value="urlMenu"
          :options="{ width: 160 }"
          ref="qrcodeRef"
        ></vue-qrcode>
      </div>
      <!-- Link -->
      <div class="text-center">
        <a :href="urlMenu" target="_blank">
          <div
            class="inline-flex min-h-[36px] cursor-pointer items-center justify-center px-2 font-bold text-op-teal"
          >
            {{ shopInfo.restaurantName }}
          </div>
        </a>
      </div>
      <!-- Download -->
      <div class="text-center" @click="download">
        <div
          class="inline-flex min-h-[36px] cursor-pointer items-center justify-center px-2 font-bold text-op-teal"
        >
          {{ $t("admin.qrcode.download") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { shareUrlAdmin } from "@/utils/utils";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const urlMenu = shareUrlAdmin(props);
    const qrcodeRef = ref();

    const download = () => {
      const a = document.createElement("a");
      console.log(qrcodeRef);
      a.href = qrcodeRef.value.$el.toDataURL("image/png");
      a.download = "qrcode.png";
      a.click();
    };

    return {
      urlMenu,
      download,
      qrcodeRef,

      notFound: false,
    };
  },
});
</script>
