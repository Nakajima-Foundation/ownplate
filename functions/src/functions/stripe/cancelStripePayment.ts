import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

import * as utils from "../../lib/utils";
import { sendMessageToCustomer } from "../notify";
import { Context } from "../../models/TestType";

import { cancelStripe } from "./intent";
import { validateCancelPayment } from "../../lib/validator";
import { orderCancelPaymentData } from "../../lib/types";

// This function is called by admin to cancel an exsting order
export const cancelStripePayment = async (db: admin.firestore.Firestore, data: orderCancelPaymentData, context: functions.https.CallableContext | Context) => {
  const ownerUid = utils.validate_owner_admin_auth(context);
  const uid = utils.validate_auth(context);

  const { restaurantId, orderId } = data;
  utils.required_params({ restaurantId, orderId });

  const validateResult = validateCancelPayment(data);
  if (!validateResult.result) {
    console.error("cancelStripePayment", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }
  if (utils.is_subAccount(context)) {
    await utils.validate_sub_account_request(db, uid, ownerUid, restaurantId);
  }

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
  const restaurantData = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurantData.uid;
  if (restaurantOwnerUid !== ownerUid) {
    console.error("cancelStripePayment: invalid operator:", uid);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const order = (await transaction.get(orderRef)).data();
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }

      if (!order.payment || !order.payment.stripe || order.payment.stripe !== "pending") {
        throw new functions.https.HttpsError("permission-denied", "Invalid order state to cancel payment.");
      }

      const paymentIntent = await cancelStripe(db, transaction, stripeRef, restaurantOwnerUid, order.id);
      const updateData = {
        orderRestaurantPaymentCanceledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        uidPaymentCanceledBy: uid,
        payment: {
          stripe: "canceled",
        },
      };
      transaction.set(orderRef, updateData, { merge: true });
      transaction.set(
        stripeRef,
        {
          paymentIntent,
        },
        { merge: true },
      );
      Object.assign(order, updateData);
      return { success: true, payment: "stripe", order };
    });
    // sendSMS is always true
    if (result.order.sendSMS) {
      await sendMessageToCustomer(db, "msg_stripe_payment_canceled", restaurantData.hasLine, restaurantData.restaurantName, result.order, restaurantId, orderId, {}, true);
    }
    return { result: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
