import Stripe from "stripe";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { order_status } from "../common/constant";
import * as utils from "../lib/utils";
import { updateOrderTotalDataAndUserLog } from "../functions/order/orderPlace";
import { notifyNewOrderToRestaurant } from "../functions/notify";
import { costCal } from "../common/commonUtils";

import * as crypto from "crypto";

const multiple = utils.getStripeRegion().multiple; // 100 for USD, 1 for JPY
const stripe = utils.get_stripe();

const getCustomerStripeInfo = async (db: any, customerUid: string) => {
  const refStripe = db.doc(`/users/${customerUid}/system/stripe`);
  const stripeInfo = (await refStripe.get()).data();
  if (!stripeInfo) {
    throw new functions.https.HttpsError("aborted", "No stripeInfo.");
  }
  return stripeInfo;
};
const getOrderData = async (transaction: any, orderRef: any) => {
  const orderDoc = await transaction.get(orderRef);
  const order = orderDoc.data();
  if (!order) {
    throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
  }
  order.id = orderDoc.id;
  return order;
};

export const getStripeOrderRecord = async (transaction: any, stripeRef: any) => {
  const stripeRecord = (await transaction.get(stripeRef)).data();
  if (!stripeRecord || !stripeRecord.paymentIntent || !stripeRecord.paymentIntent.id) {
    throw new functions.https.HttpsError("failed-precondition", "This order has no paymentIntendId.");
  }
  return stripeRecord;
};

export const getStripeAccount = async (db: any, restaurantOwnerUid: string) => {
  const paymentSnapshot = await db.doc(`/admins/${restaurantOwnerUid}/public/payment`).get();
  const stripeAccount = paymentSnapshot.data()?.stripe;
  if (!stripeAccount) {
    throw new functions.https.HttpsError("invalid-argument", "This restaurant does not support payment.");
  }
  return stripeAccount;
};
export const getPaymentMethodData = async (db: any, restaurantOwnerUid: string, customerUid: string) => {
  const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);

  const stripeInfo = await getCustomerStripeInfo(db, customerUid);
  const token = await stripe.tokens.create(
    {
      customer: stripeInfo.customerId,
    },
    {
      stripeAccount: stripeAccount,
    }
  );
  const paymentMethodData = {
    type: "card",
    card: {
      token: token.id,
    },
  };
  return paymentMethodData;
};

export const getHash = (message: string) => {
  return crypto.createHash("sha256").update(message).digest("hex");
};

// This function is called by user to create a "payment intent" (to start the payment transaction)
export const create = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const customerUid = utils.validate_auth(context);

  const { orderId, restaurantId, description, tip, sendSMS, timeToPickup, lng, memo, customerInfo } = data;
  const _tip = Number(tip) || 0;
  const roundedTip = Math.round(_tip * multiple) / multiple;
  utils.required_params({ orderId, restaurantId }); // lng, tip and sendSMS are optional
  const restaurantData = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurantData["uid"];
  const postage = restaurantData.isEC ? await utils.get_restaurant_postage(db, restaurantId) : {};

  try {
    const result = await db.runTransaction(async (transaction) => {
      const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);
      const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);

      const customerRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/customer/data`);
      const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
      const order = await getOrderData(transaction, orderRef);
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError("failed-precondition", "This order is invalid.");
      }
      const shippingCost = restaurantData.isEC ? costCal(postage, customerInfo?.prefectureId, order.total) : 0;
      const hasCustomer = restaurantData.isEC || order.isDelivery;
      if (hasCustomer) {
        // for transaction lock
        await transaction.get(customerRef);
      }

      const totalCharge = order.total + roundedTip + (shippingCost || 0) + (order.deliveryFee || 0);
      const totalChargeWithTipAndMultipled = totalCharge * multiple; // for US stripe price 

      // We expect that there is a customer Id associated with a token
      const payment_method_data = await getPaymentMethodData(db, restaurantOwnerUid, customerUid);
      const request = {
        setup_future_usage: "off_session",
        amount: totalChargeWithTipAndMultipled,
        description: `${description} ${orderId}`,
        currency: utils.getStripeRegion().currency,
        metadata: { uid: customerUid, restaurantId, orderId },
        payment_method_data,
      } as Stripe.PaymentIntentCreateParams;

      const idempotencyKey = getHash([orderRef.path, payment_method_data.card.token].join("-"));
      const paymentIntent = await stripe.paymentIntents.create(request, {
        idempotencyKey,
        stripeAccount,
      });
      const timePlaced = (timeToPickup && new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds)) || admin.firestore.FieldValue.serverTimestamp();

      // start write transaction
      await updateOrderTotalDataAndUserLog(db, transaction, customerUid, order.order, restaurantId, customerUid, timePlaced, true);
      if (hasCustomer) {
        await transaction.set(customerRef, {
          ...customerInfo,
          uid: customerUid,
          orderId,
          restaurantId,
          createdAt: admin.firestore.Timestamp.now(),
        });
      }

      const updateData = {
        status: order_status.order_placed,
        totalCharge,
        tip: roundedTip,
        shippingCost,
        sendSMS: sendSMS || false,
        updatedAt: admin.firestore.Timestamp.now(),
        orderPlacedAt: admin.firestore.Timestamp.now(),
        timePlaced,
        timePickupForQuery: timePlaced,
        description: request.description,
        memo: memo || "",
        isEC: restaurantData.isEC || false,
        // customerInfo: customerInfo || {},
        payment: {
          stripe: "pending",
        },
      };
      transaction.set(orderRef, updateData, { merge: true });
      transaction.set(
        stripeRef,
        {
          paymentIntent,
        },
        { merge: true }
      );
      Object.assign(order, updateData);
      return { success: true, order };
    });

    await notifyNewOrderToRestaurant(db, restaurantId, result.order, restaurantData.restaurantName, lng);

    return result;
  } catch (error) {
    throw utils.process_error(error);
  }
};


