<template>
  <div>
    <!-- Share / Review -->
    <div class="op-button-text" @click="openShare()">
      <i class="material-icons">launch</i>
      <span>{{$t('shopInfo.share')}}</span>
    </div>

    <!-- Share Popup-->
    <b-modal :active.sync="sharePopup" :width="488" scroll="keep" style="text-align: initial;">
      <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
        <div class="t-h6 c-text-black-disabled p-b-8">{{$t('shopInfo.share')}}</div>
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
            <div class="m-l-8 t-body2 c-text-black-disabled">{{this.url}}</div>
            <div class="m-t-24">
              <sharing-buttons :title="shopInfo.restaurantName" :url="url" />
            </div>
          </div>
        </div>
        <div class="m-t-24 align-center">
          <div class="op-button-small tertiary" @click="closeShare()">{{$t('menu.close')}}</div>
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

