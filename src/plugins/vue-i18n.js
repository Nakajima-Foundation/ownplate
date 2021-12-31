import i18nEN from '../../lang/en.json';
import i18nES from '../../lang/es.json';
import i18nJA from '../../lang/ja.json';
import i18nFR from '../../lang/fr.json';

import * as constant from './constant.js';

import { ownPlateConfig } from "@/config/project";

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

const data = {
  // locales: ['en', 'es', 'ja'],
  locale,
  fallbackLocale: locale,
  messages: {
    en: i18nEN,
    es: i18nES,
    ja: i18nJA,
    fr: i18nFR,
  },
  numberFormats: {
    en: numberFormats,
    ja: numberFormats
  },
  datetimeFormats: {
    en: dateTimeFormats,
    ja: dateTimeFormats
  }
};

export default data;
