import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as express from './functions/express';
import * as Firestore from './functions/firestore';

export const api = functions.https.onRequest(express.app);

let db = admin.firestore();
export const updateDb = (_db) => {
  db = _db;
}

export const wasOrderCreated = functions.firestore.document('restaurants/{restaurantId}/orders/{orderId}').onCreate(async (snapshot, context) => {
  await Firestore.wasOrderCreated(db, snapshot, context);
});

import * as Order from './functions/order';
export const orderUpdate = functions.https.onCall(async (data, context) => {
  return await Order.update(db, data, context);
});
export const orderPlace = functions.https.onCall(async (data, context) => {
  return await Order.place(db, data, context);
});

import * as StripeOAuth from './stripe/oauth'
export const stripeConnect = functions.https.onCall(async (data, context) => {
  return await StripeOAuth.connect(db, data, context);
});
export const stripeDisconnect = functions.https.onCall(async (data, context) => {
  return await StripeOAuth.disconnect(db, data, context);
});

import * as StripeIntent from './stripe/intent'
export const stripeCreateIntent = functions.https.onCall(async (data, context) => {
  return await StripeIntent.create(db, data, context);
});
export const stripeConfirmIntent = functions.https.onCall(async (data, context) => {
  return await StripeIntent.confirm(db, data, context);
});
export const stripeCancelIntent = functions.https.onCall(async (data, context) => {
  return await StripeIntent.cancel(db, data, context);
});

