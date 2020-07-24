import * as PNF from "google-libphonenumber";

const phoneUtil = PNF.PhoneNumberUtil.getInstance();

export const parsePhoneNumber = (phoneNumber) => {
  return phoneUtil.parse(phoneNumber);
};
export const intenationalFormat = (parsedNumber) => {
  return phoneUtil.format(parsedNumber, PNF.PhoneNumberFormat.INTERNATIONAL);
};

const localPrefix = (number) => {
  return (number.getCountryCode() == 81) ? "0" : "";
};

export const formatNational = (number) => {
  return phoneUtil.format(number, PNF.PhoneNumberFormat.NATIONAL);
};

export const formatURL = (number) => {
  const prefix = localPrefix(number);
  return "tel:" + prefix + number.getNationalNumber();
};
