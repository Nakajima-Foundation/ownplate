import {
  PhoneNumberUtil,
  PhoneNumber,
  PhoneNumberFormat,
} from "google-libphonenumber";

import { stripeRegion } from "@/utils/utils";
import { computed } from "@vue/composition-api";

const phoneUtil = PhoneNumberUtil.getInstance();

export const parsePhoneNumber = (phoneNumber: string): PhoneNumber => {
  return phoneUtil.parse(phoneNumber);
};
export const intenationalFormat = (parsedNumber: PhoneNumber): string => {
  return phoneUtil.format(parsedNumber, PhoneNumberFormat.INTERNATIONAL);
};

const localPrefix = (phoneNumber: PhoneNumber): string => {
  return phoneNumber.getCountryCode() == 81 ? "0" : "";
};

export const formatNational = (phoneNumber: PhoneNumber): string => {
  return phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);
};

export const formatURL = (phoneNumber: PhoneNumber): string => {
  const prefix = localPrefix(phoneNumber);
  return "tel:" + prefix + phoneNumber.getNationalNumber();
};

export const usePhoneNumber = (shopInfo: any) => {
  const countries = stripeRegion.countries;

  const parsedNumber = computed(() => {
    const countryCode =
      shopInfo.value.countryCode || countries.value[0].code;
    try {
      return parsePhoneNumber(countryCode + shopInfo.value.phoneNumber);
    } catch (error) {
      return null;
    }
  });

  const nationalPhoneNumber = computed(() => {
    const pnumber = parsedNumber.value;
    if (pnumber) {
      return formatNational(pnumber);
    }
    return shopInfo.value.phoneNumber;
  });

  return {
    parsedNumber,
    nationalPhoneNumber,
  };
};
