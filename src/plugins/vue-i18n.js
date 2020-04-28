import Vue from 'vue';
import VueI18n from 'vue-i18n';

import i18nEN from '../../lang/en.json';
import i18nES from '../../lang/es.json';
import i18nJA from '../../lang/ja.json';

Vue.use(VueI18n);

const defaultLocale = process.env.LOCALE || "en";
// todo change locale to region. use constant.js
const region = process.env.REGION || "US";

const numberFormats = ((locale) => {
  if (locale === 'ja') {
    return {
      currency: {
        style: 'currency',
        currency: 'JPY'
      }
    };
  }
  if (locale === 'eu') {
    return {
      currency: {
        style: 'currency',
        currency: 'EUR'
      }
    };
  }
  return {
    currency: {
      style: 'currency',
      currency: 'USD'
    }
  };
})(defaultLocale);

const locale = defaultLocale || 'en';

export default ({ app }) => {
  app.i18n = new VueI18n({
    // locales: ['en', 'es', 'ja'],
    locale,
    fallbackLocale: defaultLocale,
    messages: {
      en: i18nEN,
      es: i18nES,
      ja: i18nJA,
    },
    numberFormats: {
      en: numberFormats,
      ja: numberFormats
    }
  });
};
