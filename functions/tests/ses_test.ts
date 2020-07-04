import { should } from 'chai';
//import { expect } from 'chai';

import * as ses from './../src/functions/ses'

should()

describe('SES function', () => {
  it ('ses function', async function() {
    const to = "isamu@to-kyo.to";
    const title = "こんにちは";
    const body = "こんにちは。本文。";

    await ses.sendMail(to, title, body);
  })


});
