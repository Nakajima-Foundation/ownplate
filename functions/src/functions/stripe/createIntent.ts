import Stripe from "stripe";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { order_status } from "../../common/constant";
import * as utils from "../../lib/utils";
import { updateOrderTotalDataAndUserLog, getOrderData } from "../order/orderPlace";
import { notifyNewOrderToRestaurant } from "../notify";
import { costCal } from "../../common/commonUtils";

import { getStripeAccount, getPaymentMethodData, getHash } from "./intent";
import { validateOrderPlaced, validateCustomer } from "../../lib/validator";
import { orderPlacedData } from "../../lib/types";

const multiple = utils.stripeRegion.multiple; // 100 for USD, 1 for JPY
const stripe = utils.get_stripe();

// This function is called by user to create a "payment intent" (to start the payment transaction)
export const create = async (db: admin.firestore.Firestore, data: orderPlacedData, context: functions.https.CallableContext) => {
  const customerUid = utils.validate_customer_auth(context);

  const { restaurantId, orderId, tip, timeToPickup, memo, customerInfo } = data; // orderPlace
  utils.required_params({ restaurantId, orderId }); // tip is optinoal

  const validateResult = validateOrderPlaced(data);
  if (!validateResult.result) {
    console.error("createIntent", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  const _tip = Number(tip) || 0;
  const roundedTip = Math.round(_tip * multiple) / multiple;
  const now = admin.firestore.Timestamp.now();

  const timePlaced = (timeToPickup && new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds)) || admin.firestore.FieldValue.serverTimestamp();
  try {
    const restaurantData = await utils.get_restaurant(db, restaurantId);
    const restaurantOwnerUid = restaurantData["uid"];
    const postage = restaurantData.isEC ? await utils.get_restaurant_postage(db, restaurantId) : {};

    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
    const customerRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/customer/data`);

    const result = await db.runTransaction(async (transaction) => {
      const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);
      const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);

      const order = await getOrderData(transaction, orderRef);
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      if (customerUid !== order.uid) {
        throw new functions.https.HttpsError("permission-denied", "The user is not the owner of this order.");
      }
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError("failed-precondition", "This order is invalid.");
      }
      const shippingCost = restaurantData.isEC ? costCal(postage, customerInfo?.prefectureId, order.total) : 0;
      const hasCustomer = restaurantData.isEC || order.isDelivery;
      if (hasCustomer) {
        const validateResult = validateCustomer(customerInfo || {});
        if (!validateResult.result) {
          console.error("orderPlace", validateResult.errors);
          throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
        }
        // for transaction lock
        await transaction.get(customerRef);
      }

      const totalCharge = order.total + roundedTip + (shippingCost || 0) + (order.deliveryFee || 0);
      const totalChargeWithTipAndMultipled = totalCharge * multiple; // for US stripe price

      // We expect that there is a customer Id associated with a token
      const payment_method_data = await getPaymentMethodData(db, restaurantOwnerUid, customerUid);
      const orderNumber = utils.nameOfOrder(order.number);
      const description = `#${orderNumber} ${restaurantData.restaurantName} ${restaurantData.phoneNumber}`;
      const request = {
        setup_future_usage: "off_session",
        amount: totalChargeWithTipAndMultipled,
        description: `${description} ${orderId}`,
        currency: utils.stripeRegion.currency,
        metadata: { uid: customerUid, restaurantId, orderId },
        payment_method_data,
      } as Stripe.PaymentIntentCreateParams;

      const idempotencyKey = getHash([orderRef.path, payment_method_data.card.token].join("-"));
      const paymentIntent = await stripe.paymentIntents.create(request, {
        idempotencyKey,
        stripeAccount,
      });
      // start write transaction
      await updateOrderTotalDataAndUserLog(db, transaction, customerUid, order.order, restaurantId, restaurantOwnerUid, timePlaced, now, true);
      if (hasCustomer) {
        const { zip, prefectureId, address, name, email } = customerInfo;
        await transaction.set(customerRef, {
          zip,
          prefectureId,
          address,
          name,
          email: email || "",
          uid: customerUid,
          orderId,
          restaurantId,
          createdAt: now,
        });
      }

      const updateData = {
        status: order_status.order_placed,
        totalCharge,
        tip: roundedTip,
        shippingCost,
        sendSMS: true,
        updatedAt: now,
        orderPlacedAt: now,
        timePlaced,
        timePickupForQuery: timePlaced,
        description,
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
    await notifyNewOrderToRestaurant(db, restaurantId, result.order, restaurantData.restaurantName);

    return result;
  } catch (error) {
    throw utils.process_error(error);
  }
};
