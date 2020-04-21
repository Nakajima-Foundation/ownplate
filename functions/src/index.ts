import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import * as express from './functions/express';
import * as firestore from './functions/firestore';


export const api = functions.https.onRequest(express.app);

let db = admin.firestore();
export const updateDb = (_db) => {
  db = _db;
}

export const orderCreate = functions.firestore.document('restaurants/{restaurantId}/orders/{orderId}').onCreate(async (snapshot, context) => {
  await firestore.orderCreate(db, snapshot, context);
});

/*
export const createRestaurant = functions.https.onCall(async (data, context) => {
	return await firestore.createRestaurant(db, data, context);
});
*/

import * as Order from './functions/order';
export const orderUpdate = functions.https.onCall(async (data, context) => {
  return await Order.update(db, data, context);
});

import * as StripeOAuth from './stripe/oauth'
export const stripeConnect = functions.https.onCall(async (data, context) => {
  return await StripeOAuth.connect(data, context);
});

export const stripeDisconnect = functions.https.onCall(async (data, context) => {
  return await StripeOAuth.disconnect(data, context);
});

import * as StripeIntent from './stripe/intent'

// export const checkout = { ...Checkout }
export const stripeCreateIntent = functions.https.onCall(async (data, context) => {
  return await StripeIntent.create(data, context);
});

export const stripeConfirmIntent = functions.https.onCall(async (data, context) => {
  return await StripeIntent.confirm(data, context);
});

export const stripeCancelIntent = functions.https.onCall(async (data, context) => {
  return await StripeIntent.cancel(data, context);
});

