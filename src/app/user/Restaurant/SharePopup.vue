<template>
  <div class="is-inline-block">
    <!-- Share  Buttons -->
    <a @click="openShare()" class="inline-flex items-center justify-center">
      <i class="material-icons mr-2 text-lg text-op-teal">launch</i>
      <div class="text-sm font-bold text-op-teal">
        {{ $t("shopInfo.share") }}
      </div>
    </a>

    <!-- Share Popup-->
    <o-modal v-model:active="sharePopup" :width="488" scroll="keep">
      <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
        <!-- Title -->
        <div class="text-xl font-bold text-black text-opacity-40">
          {{ $t("shopInfo.share") }}
        </div>

        <!-- Body -->
        <div class="flex">
          <div class="mr-2 flex-shrink-0">
            <vue-qrcode :value="url" :options="{ width: 160 }"></vue-qrcode>
          </div>

          <div class="flex-1">
            <span @click="copyClipboard(url)" class="cursor-pointer">
              <div class="inline-flex items-center justify-center">
                <i class="material-icons mr-2 text-lg text-op-teal"
                  >file_copy</i
                >
                <div class="text-sm font-bold text-op-teal">
                  {{ $t(isMenu ? "shopInfo.copyMenuUrl" : "shopInfo.copyUrl") }}
                </div>
              </div>
            </span>
            <div>
              <span class="text-sm font-bold text-red-700" v-if="copied">
                {{ $t("shopInfo.UrlCopied") }}
              </span>
              <span class="text-sm font-bold text-red-700" v-if="copyError">
                {{ $t("shopInfo.UrlCopyFailed") }}
              </span>
            </div>
            <div class="text-sm text-black text-opacity-30">
              {{ url }}
            </div>

            <!-- SNS Link -->
            <div class="mt-2">
              <sharing-buttons :title="shopInfo.restaurantName" :url="url" />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-2 text-center">
          <a
            @click="closeShare()"
            class="inline-flex h-12 items-center justify-center rounded-full bg-black bg-opacity-5 px-6"
            style="min-width: 8rem"
          >
            <div class="text-base font-bold text-black text-opacity-60">
              {{ $t("menu.close") }}
            </div>
          </a>
        </div>
      </div>
    </o-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue";

import SharingButtons from "@/app/user/Restaurant/SharingButtons.vue";
import { shareUrl, useBasePath } from "@/utils/utils";
import useClipboard from "vue-clipboard3";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  components: {
    SharingButtons,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    suffix: {
      type: String,
      required: false,
    },
    isMenu: {
      type: Boolean,
      required: false,
    },
    mode: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const sharePopup = ref(false);

    const basePath = useBasePath();
    const url = shareUrl(basePath.value) + (props.suffix || "");
    const copied = ref(false);
    const copyError = ref(false);

    const openShare = () => {
      sharePopup.value = true;
    };
    const closeShare = () => {
      sharePopup.value = false;
    };

    const { toClipboard } = useClipboard();
    const copyClipboard = async (text: string) => {
      try {
        await toClipboard(text);
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2000);
        // ctx.root.$buefy.toast.open(ctx.root.$i18n.tc("shopInfo.UrlCopied"));
      } catch (e) {
        copyError.value = true;
        setTimeout(() => {
          copyError.value = false;
        }, 2000);
        console.log(e);
        //ctx.root.$buefy.toast.open(ctx.root.$i18n.tc("shopInfo.UrlCopyFailed"));
      }
    };

    return {
      openShare,
      closeShare,
      sharePopup,
      url,

      copyClipboard,

      copied,
      copyError,
    };
  },
});
</script>
