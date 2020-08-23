import twilio from 'twilio';
import { twiml_neworder } from '../common/constant';

import {
  parsePhoneNumber,
  formatNational,
  intenationalFormat,
} from "../common/phoneutil.js";

import * as functions from 'firebase-functions'

const sid =  functions.config() && functions.config().twilio &&  functions.config().twilio.sid || process.env.TWILIO_SID;
const token =  functions.config() && functions.config().twilio &&  functions.config().twilio.token || process.env.TWILIO_TOKEN;
const from =  functions.config() && functions.config().twilio &&  functions.config().twilio.phone || process.env.TWILIO_PHONE;

export const parsedNumber = (restaurant) => {
  const countryCode = restaurant.countryCode;
  try {
    return parsePhoneNumber(countryCode + restaurant.phoneNumber);
  } catch (error) {
    return null;
  }
}

export const intenationalPhoneNumber = (restaurant) => {
  const phoneNumber = parsedNumber(restaurant);
  if (phoneNumber) {
    return intenationalFormat(phoneNumber);
  }
  return phoneNumber.phoneNumber;
}

export const nationalPhoneNumber = (restaurant) => {
  const phoneNumber = parsedNumber(restaurant);
  if (phoneNumber) {
    return formatNational(phoneNumber);
  }
  return phoneNumber.phoneNumber;
}

export const phoneCall = async (restaurant) => {
  const to = intenationalPhoneNumber(restaurant);
  if (!sid || !token || !from) {
    console.log("PhoneCall: no setting");
    return
  }
  const client = twilio(sid, token, {
    region: 'us1',
    edge: 'tokyo',
  });
  console.log("PhoneCall: start");
  try {
    const call = await client.calls
      .create({
        twiml: twiml_neworder,
        to,
        from,
      });
    console.log("PhoneCall: Success");
    console.log(call.sid)
  } catch (e) {
    console.log("PhoneCall: Failed");
    console.log(e)
  };
}
