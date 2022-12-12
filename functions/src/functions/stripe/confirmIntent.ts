import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { order_status, next_transitions, order_status_keys, timeEventMapping } from "../../common/constant";
import * as utils from "../../lib/utils";
import { sendMessageToCustomer } from "../notify";

import { getStripeAccount, getStripeOrderRecord, getHash } from "./intent";
import { validateConfirmIntent } from "../../lib/validator";
import { confirmIntentData, updateDataOnorderUpdate } from "../../lib/types";

import moment from "moment-timezone";

// This function is called by admin to confurm a "payment intent" (to complete the payment transaction)
// order_accepted  not ready_to_pickup.
export const confirm = async (db: admin.firestore.Firestore, data: confirmIntentData, context: functions.https.CallableContext) => {
  const ownerUid = utils.validate_owner_admin_auth(context);

  const { restaurantId, orderId, timeEstimated } = data;
  utils.required_params({ restaurantId, orderId });

  const validateResult = validateConfirmIntent(data);
  if (!validateResult.result) {
    console.error("confirmIntent", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
  const restaurantData = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurantData["uid"];
  const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);
  if (restaurantOwnerUid !== ownerUid) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const order = (await transaction.get(orderRef)).data();
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      order.id = orderId;

      if (order.status !== order_status.order_placed) {
        throw new functions.https.HttpsError("failed-precondition", "This order is not ready yet.");
      }
      if (!order.payment || order.payment.stripe !== "pending") {
        throw new functions.https.HttpsError("failed-precondition", "Stripe process was done.");
      }

      const nextStatus = next_transitions[order.status];
      // just stripe
      const stripeRecord = await getStripeOrderRecord(transaction, stripeRef);
      const paymentIntentId = stripeRecord.paymentIntent.id;

      const idempotencyKey = getHash([order.id, paymentIntentId].join("-"));
      const stripe = utils.get_stripe();
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        idempotencyKey,
        stripeAccount,
      });
      // just end of stripe

      // everything are ok
      const updateTimeKey = timeEventMapping[order_status_keys[nextStatus]];
      const updateData: updateDataOnorderUpdate = {
        status: nextStatus,
        updatedAt: admin.firestore.Timestamp.now(),
        [updateTimeKey]: admin.firestore.Timestamp.now(),
        payment: {
          stripe: "confirmed",
        },
      };
      if (nextStatus === order_status.order_accepted) {
        updateData.timeEstimated = timeEstimated ? new admin.firestore.Timestamp(timeEstimated.seconds, timeEstimated.nanoseconds) : order.timePlaced;
        updateData.timePickupForQuery = updateData.timeEstimated;
        order.timeEstimated = updateData.timeEstimated;
      }
      await transaction.set(orderRef, updateData, { merge: true });
      await transaction.set(
        stripeRef,
        {
          paymentIntent,
        },
        { merge: true }
      );

      Object.assign(order, updateData);
      return { success: true, order };
    });

    const orderData = result.order;

    const params = {
      time: moment(orderData.timeEstimated.toDate()).tz(utils.timezone).locale("ja").format("LLL"),
    };

    const msgKey = orderData.isEC ? "msg_ec_order_accepted" : "msg_order_accepted";
    await sendMessageToCustomer(db, msgKey, restaurantData.restaurantName, orderData, restaurantId, orderId, params);

    return { result: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
