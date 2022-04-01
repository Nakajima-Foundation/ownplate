import { PhoneNumberUtil, PhoneNumber, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export const parsePhoneNumber = (phoneNumber: string) => {
  return phoneUtil.parse(phoneNumber);
};
export const intenationalFormat = (parsedNumber: PhoneNumber) => {
  return phoneUtil.format(parsedNumber, PhoneNumberFormat.INTERNATIONAL);
};

const localPrefix = (phoneNumber: PhoneNumber) => {
  return phoneNumber.getCountryCode() == 81 ? "0" : "";
};

export const formatNational = (phoneNumber: PhoneNumber) => {
  return phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);
};

export const formatURL = (phoneNumber: PhoneNumber) => {
  const prefix = localPrefix(phoneNumber);
  return "tel:" + prefix + phoneNumber.getNationalNumber();
};
