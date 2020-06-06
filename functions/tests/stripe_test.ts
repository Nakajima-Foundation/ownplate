import { should } from 'chai';

import * as stripeLog from '../src/lib/stripeLog';
//import * as express from '../src/functions/express';

import * as test_db_helper from './test_db_helper';

import * as test_jcb_data from './data/capabilityupdated/jcb_payments';
import * as accountupdated from './data/accountupdated/data';

const adminDB = test_db_helper.adminDB();

should()

describe('stripe tests', () => {
  it ('capability_updated stripe test', async function() {
    await stripeLog.capability_updated(adminDB, { data: test_jcb_data.jcb_one});
  });

  it ('account_updated stripe test', async function() {
    await stripeLog.account_updated(adminDB, { data: accountupdated.data});
  });
});
