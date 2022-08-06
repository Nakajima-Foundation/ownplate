import {
  PhoneNumberUtil,
  PhoneNumber,
  PhoneNumberFormat,
} from "google-libphonenumber";

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
