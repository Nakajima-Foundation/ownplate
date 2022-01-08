<template>
  <div class="is-inline-block">
    <!-- Share  Buttons -->
    <a @click="openShare()" class="inline-flex justify-center items-center">
      <i class="material-icons text-lg text-op-teal mr-2">launch</i>
      <div class="text-sm font-bold text-op-teal">
        {{ $t("shopInfo.share") }}
      </div>
    </a>

    <!-- Share Popup-->
    <b-modal
      v-model:active="sharePopup"
      :width="488"
      scroll="keep"
      style="text-align: initial; "
    >
      <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
        <!-- Title -->
        <div class="text-xl font-bold text-black text-opacity-40">
          {{ $t("shopInfo.share") }}
        </div>

        <!-- Body -->
        <div class="flex">
          <div class="flex-shrink-0 mr-2">
            <vue-qrcode :value="url" :options="{ width: 160 }"></vue-qrcode>
          </div>

          <div class="flex-1">
            <router-link to="#" @click.native="copyClipboard()" event>
              <div class="inline-flex justify-center items-center">
                <i class="material-icons text-lg text-op-teal mr-2"
                  >file_copy</i
                >
                <div class="text-sm font-bold text-op-teal">
                  {{ $t("shopInfo.copyUrl") }}
                </div>
              </div>
            </router-link>
            <div v-if="showOkMessage" class=" font-bold text-red-600">
              {{ $t("shopInfo.UrlCopied") }}
            </div>
            <div v-if="showNgMessage" class=" font-bold text-red-600">
              {{ $t("shopInfo.UrlCopyFailed") }}
            </div>
            <div class="text-sm text-black text-opacity-30">
              {{ this.url }}
            </div>

            <div class="mt-6">
              <sharing-buttons :title="shopInfo.restaurantName" :url="url" />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 text-center">
          <a
            @click="closeShare()"
            class="inline-flex justify-center items-center h-12 rounded-full px-6 bg-black bg-opacity-5"
            style="min-width: 8rem;"
          >
            <div class="text-base font-bold text-black text-opacity-60">
              {{ $t("menu.close") }}
            </div>
          </a>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

import SharingButtons from "~/app/user/Common/SharingButtons";
import { db, firestore } from "~/plugins/firebase.js";

import useClipboard from 'vue-clipboard3'
import {
  useShareUrl,
  sleep,
} from "~/utils/utils";

export default defineComponent({
  components: {
    SharingButtons,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true
    },
    suffix: {
      type: String,
      required: false
    }
  },
  setup() {
    const { toClipboard } = useClipboard()
    const shareUrl = useShareUrl();

    const showOkMessage = ref(false);
    const showNgMessage = ref(false);

    const sharePopup = ref(false);
    const openShare = () => {
      sharePopup.value = true;
    };
    const closeShare = () => {
      sharePopup.value = false;
    }
    const copyClipboard = async () => {
      try {
        await toClipboard(shareUrl.value);
        showOkMessage.value = true;
        await sleep(2);
        showOkMessage.value = false;
      } catch (e) {
        showNgMessage.value = true;
        await sleep(2);
        showNgMessage.value = false;
      }
    };
    return {
      sharePopup,
      openShare,
      closeShare,

      copyClipboard,

      showOkMessage,
      showNgMessage,
    };
  },
});
</script>
