import Vue from 'vue';
import { storage } from "~/plugins/firebase.js";
import { ownPlateConfig } from "@/config/project";
import { regionalSettings } from "~/plugins/constant.js";
import * as Cookie from "cookie";

export default ({ app }) => {
  Vue.mixin({
    methods: {
      isNull(value) {
        return value === null || value === undefined;
      },
      restaurantId() {
        return this.$route.params.restaurantId;
      },
      shareUrl() {
        return location.protocol + "//" + location.host + "/r/" + this.restaurantId();
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
        let ampm = "AM";
        if (num >= 60 * 12) {
          ampm = "PM";
          if (num >= 60 * 13) {
            num = num - 60 * 12;
          }
        }
        return [
          String(Math.floor(num / 60)).padStart(2, '0'),
          ":",
          String(num % 60).padStart(2, '0'),
          " ",
          ampm].join("");
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
      lineAuthURL(path, options, channelId) {
        const state = "s" + Math.random();
        const nonce = "n" + Math.random();
        console.log("lineAuthURL", state)
        const query = {
          response_type: "code",
          client_id: channelId || ownPlateConfig.line.LOGIN_CHANNEL_ID,
          redirect_uri: location.origin + path,
          scope: "profile openid email",
          bot_prompt: "aggressive",
          state,
          nonce
        };
        const params = JSON.stringify(Object.assign({}, options || {},
          { state, nonce }));
        document.cookie = `line_params=${encodeURIComponent(params)};path=${path}`;
        console.log("cookies", Cookie.parse(document.cookie))
        const queryString = Object.keys(query)
          .map(key => {
            return key + "=" + encodeURIComponent(query[key]);
          })
          .join("&");
        return `https://access.line.me/oauth2/v2.1/authorize?${queryString}`;
      },
      lineGuard(nonce) {
        const state = this.$route.query.state;
        const cookies = Cookie.parse(document.cookie);
        console.log(cookies);
        const params = JSON.parse(cookies.line_params);
        console.log("*** lineGuard", params, state, nonce, params.nonce);

        if (state !== params.state || nonce !== params.nonce) {
          throw new Error("invalid state");
        }
        return params;
      }
    },
    computed: {
      regionalSetting() {
        return regionalSettings[ownPlateConfig.region || "US"];
      },
      user() {
        return this.$store.state.user;
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
        return this.$i18n.locale === "ja";
      },
      serviceKey() {
        return this.isJapan ? "omochikaeri" : "ownPlate";
      },
    }
  });
}
