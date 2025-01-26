import twilio from "twilio";
import { defineSecret } from "firebase-functions/params";

import { twiml_neworder } from "../common/constant";
import { parsePhoneNumber, formatNational, intenationalFormat } from "../common/phoneutil";
import { enableNotification } from "../notificationConfig";



const sid = process.env.TWILIO_SID;
const token = process.env.TWILIO_TOKEN;
const phone_from = process.env.TWILIO_PHONE;

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
  if (!sid || !token || !phone_from) {
    console.log("PhoneCall: no setting");
    return;
  }
  const client = twilio(sid, token, {
    edge: "tokyo",
  });
  console.log("PhoneCall: start");
  try {
    const call = await client.calls.create({
      twiml: twiml_neworder,
      to,
      timeout: 100,
      from: phone_from,
    });
    console.log("PhoneCall: Success");
    console.log(call.sid);
  } catch (e) {
    console.log("PhoneCall: Failed");
    console.log(e);
  }
};
