<template>
  <div>
    <!-- Share / Review -->
    <div class="m-t-8 align-center">
      <div class="op-button-text m-r-8" @click="openShare()">
        <i class="material-icons">launch</i>
        <span>Share</span>
      </div>
      <!-- <sharing-buttons :title="name" :url="shareUrl()" /> -->
    </div>
    <!-- Share Popup-->
    <b-modal :active.sync="sharePopup" :width="488" scroll="keep">
      <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
        <div class="t-h6 c-text-black-disabled p-b-8">Share</div>
        <div class="cols">
          <div>
            <qrcode :value="url" :options="{ width: 160 }"></qrcode>
          </div>
          <div>
            <nuxt-link to="#" @click.native="copyClipboard(url)" event>
              <div class="op-button-text m-t-8">
                <i class="material-icons">file_copy</i>
                <span>{{$t('shopInfo.copyUrl')}}</span>
              </div>
            </nuxt-link>
            <div
              class="m-l-8 t-body2 c-text-black-disabled"
              style="word-break: break-all;"
            >{{this.url}}</div>
            <div class="m-t-24">
              <sharing-buttons :title="shopInfo.restaurantName" :url="url" />
            </div>
          </div>
        </div>
        <div class="m-t-24 align-center">
          <div class="op-button-small tertiary" @click="closeShare()">Close</div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import SharingButtons from "~/app/user/Common/SharingButtons";

export default {
  components: {
    SharingButtons
  },
  props: {
    shopInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      url: this.shareUrl(),
      sharePopup: false
    };
  },
  methods: {
    openShare() {
      this.sharePopup = true;
    },
    closeShare() {
      this.sharePopup = false;
    }
  }
};
</script>

