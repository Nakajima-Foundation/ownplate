import * as PNF from "google-libphonenumber";

const phoneUtil = PNF. PhoneNumberUtil.getInstance();

export const parsePhoneNumber = (phoneNumber) => {
    return phoneUtil.parse(phoneNumber);
}

export const formatNational = (number) => {
    return phoneUtil.format(number, PNF.NATIONAL);
}