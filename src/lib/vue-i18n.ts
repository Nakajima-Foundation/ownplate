import {
  createI18n,
  type IntlDateTimeFormat,
  type IntlNumberFormat,
} from "vue-i18n";

import i18nEN from "@/lang/en";
import i18nES from "@/lang/es";
import i18nJA from "@/lang/ja";
import i18nFR from "@/lang/fr";
import i18nKO from "@/lang/ko";
import i18nZH_CN from "@/lang/zh-CN";
import i18nZH_TW from "@/lang/zh-TW";
import i18nTH from "@/lang/th";
import i18nVI from "@/lang/vi";
import i18nID from "@/lang/id";

import { stripe_regions_jp } from "@/config/constant";

const numberFormats: IntlNumberFormat = {
  currency: {
    style: "currency",
    currency: stripe_regions_jp.currency,
  },
};

const datetimeFormats: IntlDateTimeFormat = {
  short: {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  },
  time: {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  },
  long: {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  },
};

const locale = stripe_regions_jp.langs[0] || "en";

const i18nData = {
  legacy: false,
  locale,
  fallbackLocale: "en",
  messages: {
    en: i18nEN,
    es: i18nES,
    ja: i18nJA,
    fr: i18nFR,
    ko: i18nKO,
    "zh-CN": i18nZH_CN,
    "zh-TW": i18nZH_TW,
    th: i18nTH,
    vi: i18nVI,
    id: i18nID,
  },
  numberFormats: {
    en: numberFormats,
    ja: numberFormats,
    ko: numberFormats,
    "zh-CN": numberFormats,
    "zh-TW": numberFormats,
    th: numberFormats,
    vi: numberFormats,
    id: numberFormats,
  },
  datetimeFormats: {
    en: datetimeFormats,
    ja: datetimeFormats,
    "ja-JP": datetimeFormats,
    ko: datetimeFormats,
    "zh-CN": datetimeFormats,
    "zh-TW": datetimeFormats,
    th: datetimeFormats,
    vi: datetimeFormats,
    id: datetimeFormats,
  },
};
const i18n = createI18n(i18nData);

export default i18n;
