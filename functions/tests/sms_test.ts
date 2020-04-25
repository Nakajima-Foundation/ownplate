import { should } from 'chai';
//import { expect } from 'chai';

import * as sms from './../src/functions/sms'

should()

describe('SMS function', () => {
  it ('sms function', async function() {
    const subject = "From OwnPlate";
    const message = 'hello';
    const phone_number = "+81-xxxx-xxxx";

    sms.pushSMS(subject, message, phone_number);
  })


});
