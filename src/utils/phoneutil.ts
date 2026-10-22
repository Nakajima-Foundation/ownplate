import googleLibPhoneNumber, { type PhoneNumber } from "google-libphonenumber";

// 名前付き import にしない。google-libphonenumber は CommonJS で、node の ESM 側が
// 名前を読めず SyntaxError になる（root は "type": "module"）。既定 import からほどく。
const { PhoneNumberUtil, PhoneNumberFormat } = googleLibPhoneNumber;

const phoneUtil = PhoneNumberUtil.getInstance();

export const parsePhoneNumber = (phoneNumber: string): PhoneNumber => {
  return phoneUtil.parse(phoneNumber);
};
export const internationalFormat = (parsedNumber: PhoneNumber): string => {
  return phoneUtil.format(parsedNumber, PhoneNumberFormat.INTERNATIONAL);
};

const localPrefix = (phoneNumber: PhoneNumber): string => {
  return phoneNumber.getCountryCode() === 81 ? "0" : "";
};

export const formatNational = (phoneNumber: PhoneNumber): string => {
  return phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);
};

export const formatURL = (phoneNumber: PhoneNumber): string => {
  const prefix = localPrefix(phoneNumber);
  return "tel:" + prefix + phoneNumber.getNationalNumber();
};
