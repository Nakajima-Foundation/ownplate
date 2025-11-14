import { createI18n } from "vue-i18n";

import i18nEN from "@/lang/en";
import i18nES from "@/lang/es";
import i18nJA from "@/lang/ja";
import i18nFR from "@/lang/fr";

import { stripe_regions_jp } from "@/config/constant";

const numberFormats = {
  currency: {
    style: "currency",
    currency: stripe_regions_jp.currency,
  },
};

const datetimeFormats = {
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
  // locales: ['en', 'es', 'ja'],
  legacy: false,
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
    ja: numberFormats,
  } as any,
  datetimeFormats: {
    en: datetimeFormats,
    ja: datetimeFormats,
    "ja-JP": datetimeFormats,
  } as any,
};
const i18n = createI18n(i18nData);

export default i18n;
