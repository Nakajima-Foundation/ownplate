import { should } from 'chai';
//import { expect } from 'chai';

import * as dynamiclink from './../src/functions/dynamiclink'

should()

describe('dynamiclink function', () => {
  it ('dynamiclink function', async function() {
    const res = await dynamiclink.createlink();
    if (res.status === 200) {
      const data = await res.json();
      console.log(data);
    }
    console.log(res);
  })


});
