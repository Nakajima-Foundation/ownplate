import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import * as Sentry from '@sentry/node';

import exportIfNeeded from './common/exportifneeded';

const senty_dsn = functions.config() && functions.config().senty && functions.config().senty.dsn || process.env.SENTY_DSN;

Sentry.init({ dsn: senty_dsn });

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

exportIfNeeded("api", "api", exports);

exportIfNeeded("systemGetConfig", "systemGetConfig", exports);

import * as Line from './functions/line';
exports.lineValidate = functions.https.onCall(async (data, context) => {
  return await Line.validate(db, data, context);
});

exportIfNeeded("wasOrderCreated2", "order/wasOrderCreated2", exports);
exportIfNeeded("orderUpdate", "order/orderUpdate", exports);
exportIfNeeded("orderPlace", "order/orderPlace", exports);

import * as StripeOAuth from './stripe/oauth'
exports.stripeConnect = functions.https.onCall(async (data, context) => {
  return await StripeOAuth.connect(db, data, context);
});
exports.stripeDisconnect = functions.https.onCall(async (data, context) => {
  return await StripeOAuth.disconnect(db, data, context);
});

import * as StripeIntent from './stripe/intent'
exports.stripeCreateIntent = functions.https.onCall(async (data, context) => {
  return await StripeIntent.create(db, data, context);
});
exports.stripeConfirmIntent = functions.https.onCall(async (data, context) => {
  return await StripeIntent.confirm(db, data, context);
});
exports.stripeCancelIntent = functions.https.onCall(async (data, context) => {
  return await StripeIntent.cancel(db, data, context);
});
