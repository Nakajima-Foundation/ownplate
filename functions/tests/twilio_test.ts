import chai from 'chai';
import { should } from 'chai';
import chaiString from "chai-string";
//import { expect } from 'chai';
chai.use(chaiString);

import * as twilio from './../src/functions/twilio'

should()

const test_phone_number = process.env.TWILIO_TEST_PHONE;

describe('twilio function', () => {
  it ('twilio function', async function() {
    const restaurant = {
      countryCode: "+81",
      phoneNumber: "03-3333-3333"
    };

    const num = twilio.parsedNumber(restaurant);
    num.values_[1].should.equal(81);
    num.values_[2].should.equal(333333333);

    const num2 = twilio.nationalPhoneNumber(restaurant);
    num2.should.equal("03-3333-3333")

    const restaurantCall = {
      countryCode: "+81",
      phoneNumber: test_phone_number
    };

    if (test_phone_number) {
      const num3 = twilio.intenationalPhoneNumber(restaurantCall);
      num3.should.startWith("+81");

      await twilio.phoneCall(restaurantCall);
    }

  })


});
