import Vue from 'vue';
import { storage } from "~/plugins/firebase.js";
import { ownPlateConfig } from "@/config/project";
import { soundFiles, regionalSettings } from "~/plugins/constant.js";
import moment from "moment";
import * as Cookie from "cookie";
import { db } from "~/plugins/firebase.js";

import { defaultHeader } from "./header";

export default ({ app }) => {
  Vue.mixin({
    methods: {
      isNull(value) {
        return value === null || value === undefined;
      },
      isEmpty(value) {
        return value === null || value === undefined || value === "";
      },
      restaurantId() {
        return this.$route.params.restaurantId;
      },
      resizedProfileImage(restaurant, size) {
        return (restaurant.images?.profile?.resizedImages || {})[size] || restaurant.restProfilePhoto;
      },
      shareUrl() {
        return location.protocol + "//" + location.host + "/r/" + this.restaurantId();
        // return "https://omochikaeri.com/r/" + this.restaurantId();
      },
      doc2data(dataType) {
        return (doc) => {
          const data = doc.data();
          data.id = doc.id;
          data._dataType = dataType;
          return data;
        };
      },
      array2obj(array) {
        return array.reduce((tmp, current) => {
          tmp[current.id] = current;
          return tmp;
        }, {});
      },
      num2time(num) {
        if (num === 0 || num === 60 * 24) {
          return this.$t("shopInfo.midnight");
        }
        if (num === 60 * 12) {
          return this.$t("shopInfo.noon");
        }
        const offsetTime = (this.$i18n.locale == "ja") ? 12 : 13;
        const isPm = (num >= 60 * 12);
        if (num >= 60 * offsetTime) {
          num = num - 60 * 12;
        }
        const formatedTime = [
          String(Math.floor(num / 60)).padStart(2, '0'),
          ":",
          String(num % 60).padStart(2, '0'),
          " "
        ].join("");

        if (isPm) {
          return this.$tc('shopInfo.pm', 1, {formatedTime});
        }
        return this.$tc('shopInfo.am', 0, {formatedTime});

      },
      countObj(obj) {
        if (Array.isArray(obj)) {
          return obj.reduce((tmp, value) => {
            // nested array
            if (Array.isArray(value)) {
              return tmp + this.countObj(value);
            }
            return tmp + 1;
          }, 0);
        }
        return Object.keys(obj).reduce((tmp, key) => {
          return this.countObj(obj[key]) + tmp;
        }, 0);
      },
      cleanObject(obj) {
        return Object.keys(obj).reduce((tmp, key) => {
          if (!this.isNull(obj[key])) {
            tmp[key] = obj[key];
          }
          return tmp;
        }, {});
      },
      copyClipboard: async function (text) {
        try {
          await this.$copyText(text);
          this.$buefy.toast.open(app.i18n.tc('shopInfo.UrlCopied'));
        } catch (e) {
          this.$buefy.toast.open(app.i18n.tc('shopInfo.UrlCopyFailed'));
        }
      },
      forcedError(key) {
        const debug = this.$route.query.error;
        return debug === key ? "---forced-error---" : "";
      },
      uploadFile(file, path) {
        return new Promise((resolve, rejected) => {
          let storageRef = storage.ref();
          let mountainsRef = storageRef.child(path);
          let uploadTask = mountainsRef.put(file);

          uploadTask.on(
            "state_changed",
            (snapshot) => { },
            (err) => {
              rejected(err);
            },
            async () => {
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              resolve(downloadURL);
            }
          );
        });
      },
      moment(value) {
        return moment(value);
      },
      soundPlay(reason) {
        this.$store.commit("pingOrderEvent");
        if (reason) {
          console.log("order: call play: " + reason);
        } else {
          console.log("order: call play");
        }
      },
      getSoundIndex (nameKey) {
        if (nameKey) {
          const index = soundFiles.findIndex(data => data.nameKey === nameKey);
          return (index >= 0) ? index : 0;
        }
        return 0;
      },
      async getShopOwner(uid) {
        const admin = await db.doc(`/admins/${uid}`).get();
        if (admin && admin.exists) {
          return admin.data();
        }
        return {hidePrivacy: false};
      },
      arraySum(arr) {
        return Object.values(arr||[0]).reduce((accumulator, currentValue) => accumulator + currentValue);
      },
      arrayOrNumSum(arr) {
        return Array.isArray(arr) ? this.arraySum(arr) : (arr || 0);
      },
      getOrderItems(orderInfo, menuObj) {
        if (orderInfo.order && orderInfo.menuItems) {
          return Object.keys(orderInfo.order).reduce((tmp, menuId) => {
            const numArray = Array.isArray(orderInfo.order[menuId]) ? orderInfo.order[menuId] : [orderInfo.order[menuId]];
            const opt = orderInfo.options && orderInfo.options[menuId] ? orderInfo.options[menuId] : null;
            const optArray = Array.isArray(orderInfo.order[menuId]) ? orderInfo.options[menuId] || {} : {0:  orderInfo.options[menuId]};
            Object.keys(numArray).map(numKey => {
              tmp.push({
                item: orderInfo.menuItems[menuId] || menuObj[menuId] || {},
                count: numArray[numKey],
                id: menuId,
                options: optArray[numKey],
              });
            });
            return tmp;
          }, []);
        }
        return [];
      },
    },
    computed: {
      defaultTitle() {
        return defaultHeader.title;
      },
      regionalSetting() {
        return regionalSettings[ownPlateConfig.region || "US"];
      },
      user() {
        return this.$store.state.user;
      },
      isAdmin() {
        return !!this.$store.getters.uidAdmin;
      },
      isCustomer() {
        return !!this.$store.getters.uidUser;
      },
      isLineUser() {
        const claims = this.$store.state.claims;
        return !!claims?.line;
      },
      isLineEnabled() {
        return !!ownPlateConfig.line;
      },
      isJapan() {
        return ownPlateConfig.region === "JP";
      },
      isLocaleJapan() {
        // for hack
        console.log(this.$i18n.locale);
        // return this.$i18n.locale === "ja";
        return this.$i18n.locale !== "en";
      },
      serviceKey() {
        return this.isJapan ? "omochikaeri" : "ownPlate";
      },
      // for user agent detect
      isIOS() {
        return this.isOldIOS || this.isNewIOS;
      },
      isOldIOS() {
        return /iP(hone|(o|a)d)/.test(navigator.userAgent);
      },
      isNewIOS() {
        return this.isSafari && typeof document.ontouchstart !== 'undefined';
      },
      isSafari() {
        return /Safari/.test(navigator.userAgent);
      },
      isAndroid() {
        // not implemented
        return null;
      },
      isInLine() {
        return /Line/.test(navigator.userAgent);
      },
      isInFacebook() {
      },
      isInTwitter() {
      },
      featureHeroMobile() {
        return this.regionalSetting.FeatureHeroMobile[
          this.isLocaleJapan ? "ja" : "en"
        ];
      },
      featureHeroTablet() {
        return this.regionalSetting.FeatureHeroTablet[
          this.isLocaleJapan ? "ja" : "en"
        ];
      }
    }
  });
}
