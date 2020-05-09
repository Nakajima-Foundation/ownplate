import Vue from 'vue';
import VueI18n from 'vue-i18n';

import i18nEN from '../../lang/en.json';
import i18nES from '../../lang/es.json';
import i18nJA from '../../lang/ja.json';

import * as constant from './constant.js';

import { ownPlateConfig } from "@/config/project";

Vue.use(VueI18n);

const region = ownPlateConfig.region || "US";

const region_data = constant.stripe_regions[region];

const numberFormats = {
  currency: {
    style: 'currency',
    currency: region_data.currency,
  }
};

const dateTimeFormats = {
  short: {
    year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'
  },
  time: {
    hour: 'numeric', minute: 'numeric', hour12: true
  },
  long: {
    year: 'numeric', month: 'short', day: 'numeric',
    weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true
  }
}

const locale = region_data.langs[0] || 'en';

const i18n = new VueI18n({
  // locales: ['en', 'es', 'ja'],
  locale,
  fallbackLocale: locale,
  messages: {
    en: i18nEN,
    es: i18nES,
    ja: i18nJA,
  },
  numberFormats: {
    en: numberFormats,
    ja: numberFormats
  },
  dateTimeFormats: {
    en: dateTimeFormats,
    ja: dateTimeFormats
  }
});

export default ({ app }) => {
  app.i18n = i18n;
};
