import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import API from './api'

import * as firestore from './functions/firestore';


admin.initializeApp();

export const api = functions.https.onRequest(API);

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

/*
 Payment processing
 */

import * as Checkout from './checkout'

export const checkoutCreate = functions.https.onCall(async (data, context) => {
  return await Checkout.create(data, context);
});

export const checkoutConfirm = functions.https.onCall(async (data, context) => {
  return await Checkout.confirm(data, context);
});
