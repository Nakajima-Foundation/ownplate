import { should } from 'chai';

import * as stripeLog from '../src/lib/stripeLog';
//import * as express from '../src/functions/express';

import * as test_db_helper from './test_db_helper';

import * as test_jcb_data from './data/capabilityupdated/jcb_payments';
import * as accountupdated from './data/accountupdated/data';

import * as authorized from './data/accounts/application.authorized';
import * as deauthorized from './data/accounts/application.deauthorized';



const adminDB = test_db_helper.adminDB();

should()

const uid = "aaabbbccc1";
const uid2 = "aaabbbccc2";

describe('stripe tests', async () => {
  before(async() => {
    await adminDB.doc(`admins/${uid}/public/payment`).set({
      stripe: "acct_xxxxxxxx",
      isConnected: true
    })
    await adminDB.doc(`admins/${uid2}/public/stripe`).set({
      stripeAccount: "acct_yyyyy",
      isConnected: true
    })
  });

  it ('capability_updated stripe test', async function() {
    const res = await stripeLog.capability_updated(adminDB, { data: test_jcb_data.jcb_one});
    (res[0] as any)["uid"].should.equal(uid2);
  });

  it ('account_updated stripe test', async function() {
    const res = await stripeLog.account_updated(adminDB, { data: accountupdated.data});
    (res[0] as any)["uid"].should.equal(uid);
  });

  it ('authorized stripe test', async function() {
    const res = await stripeLog.account_authorized(adminDB, authorized.authorized);
    (res[0] as any)["uid"].should.equal(uid);
  });
  it ('deauthorized stripe test', async function() {
    const res = await stripeLog.account_deauthorized(adminDB, deauthorized.deauthorized);
    (res[0] as any)["uid"].should.equal(uid);
  });
});
