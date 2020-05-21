import Vue from 'vue';

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
    }
  });
}
