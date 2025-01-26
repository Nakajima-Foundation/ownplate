import twilio from "twilio";
import { defineSecret } from "firebase-functions/params";

import { twiml_neworder } from "../common/constant";
import { parsePhoneNumber, formatNational, intenationalFormat } from "../common/phoneutil";
import { enableNotification } from "../notificationConfig";

const twilio_sid = defineSecret("TWILIO_SID");
const twilio_token = defineSecret("TWILIO_TOKEN");
const twilio_phone_from = defineSecret("TWILIO_PHONE");

export const parsedNumber = (restaurant) => {
  const countryCode = restaurant.countryCode;
  try {
    return parsePhoneNumber(countryCode + restaurant.phoneNumber);
  } catch (__error) {
    return null;
  }
};

export const intenationalPhoneNumber = (restaurant) => {
  const phoneNumber = parsedNumber(restaurant);
  if (phoneNumber) {
    return intenationalFormat(phoneNumber);
  }
  return restaurant.phoneNumber;
};

export const nationalPhoneNumber = (restaurant) => {
  const phoneNumber = parsedNumber(restaurant);
  if (phoneNumber) {
    return formatNational(phoneNumber);
  }
  return restaurant.phoneNumber;
};

export const phoneCall = async (restaurant) => {
  if (!enableNotification) {
    return;
  }
  const to = intenationalPhoneNumber(restaurant);
  if (!twilio_sid.value() || !twilio_token.value() || !twilio_phone_from.value()) {
    console.log("PhoneCall: no setting");
    return;
  }
  const client = twilio(twilio_sid.value(), twilio_token.value(), {
    edge: "tokyo",
  });
  console.log("PhoneCall: start");
  try {
    const call = await client.calls.create({
      twiml: twiml_neworder,
      to,
      timeout: 100,
      from: twilio_phone_from.value(),
    });
    console.log("PhoneCall: Success");
    console.log(call.twilio_sid.value());
  } catch (e) {
    console.log("PhoneCall: Failed");
    console.log(e);
  }
};
