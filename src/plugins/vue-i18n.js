import Vue from 'vue';
import VueI18n from 'vue-i18n';

import i18nEN from '../../lang/en.json';
import i18nES from '../../lang/es.json';
import i18nJA from '../../lang/ja.json';

Vue.use(VueI18n);

const defaultLocale = process.env.LOCALE || "en";

//    locales: ['en', 'es', 'ja'],

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

export default ({ app }) => {
  // const locale = app.$cookies.get('locale') || 'ja';
  const locale =  'ja';
  app.i18n = new VueI18n({
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
