import { should } from "chai";
//import { expect } from 'chai';

import * as sms from "./../src/functions/sms";

should();

const PHONE = process.env.PHONE;

describe("SMS function", () => {
  it("sms function", async function () {
    const subject = "From OwnPlate";
    const message = "Hello, this is a pen";
    const phone_number = PHONE;

    sms.pushSMS(subject, message, phone_number);
  });
});
