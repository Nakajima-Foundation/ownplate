import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import moment from "moment-timezone";

import * as utils from "../../lib/utils";
import { order_status, possible_transitions, order_status_keys, timeEventMapping } from "../../common/constant";
import { sendMessageToCustomer } from "../notify";

import { orderUpdateData, updateDataOnorderUpdate } from "../../lib/types";
import { validateOrderUpadte } from "../../lib/validator";

// This function is called by admins (restaurant operators) to update the status of order
export const update = async (db: admin.firestore.Firestore, data: orderUpdateData, context: functions.https.CallableContext) => {
  const ownerUid = utils.validate_owner_admin_auth(context);
  const { restaurantId, orderId, status, timeEstimated } = data;
  utils.required_params({ restaurantId, orderId, status });

  const validateResult = validateOrderUpadte(data);
  if (!validateResult.result) {
    console.error("orderUpdate", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  try {
    const restaurantDoc = await db.doc(`restaurants/${restaurantId}`).get();
    const restaurant = restaurantDoc.data() || {};
    if (restaurant.uid !== ownerUid) {
      throw new functions.https.HttpsError("permission-denied", "The user does not have an authority to perform this operation.");
    }

    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
    let msgKey: string | undefined = undefined;

    const result = await db.runTransaction(async (transaction) => {
      const order = (await transaction.get(orderRef)).data();
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      order.id = orderId;

      const possible_transition = possible_transitions[order.status];
      if (!possible_transition[status]) {
        throw new functions.https.HttpsError("failed-precondition", "It is not possible to change state from the current state.", order.status);
      }

      if (status === order_status.order_canceled && order.payment && order.payment.stripe) {
        throw new functions.https.HttpsError("permission-denied", "Paid order can not be cancele like this", status);
      }
      if (
        (order.status === order_status.ready_to_pickup || order.status === order_status.order_accepted) &&
        order.payment &&
        order.payment.stripe &&
        order.payment &&
        order.payment.stripe === "pending"
      ) {
        throw new functions.https.HttpsError("permission-denied", "Paid order can not be change like this", status);
      }

      if (status === order_status.order_accepted) {
        msgKey = order.isEC ? "msg_ec_order_accepted" : "msg_order_accepted";
      }
      if (status === order_status.ready_to_pickup) {
        if (order.isEC) {
          msgKey = "msg_ec_cooking_completed";
        } else {
          if (order && order.timeEstimated) {
            const diffDay = (moment().toDate().getTime() - order.timeEstimated.toDate().getTime()) / 1000 / 3600 / 24;
            console.log("timeEstimated_diff_days = " + String(diffDay));
            if (diffDay < 1) {
              msgKey = "msg_cooking_completed";
            }
          }
        }
      }

      // everything are ok
      const updateTimeKey = timeEventMapping[order_status_keys[status]];
      const updateData: updateDataOnorderUpdate = {
        status,
        updatedAt: admin.firestore.Timestamp.now(),
        [updateTimeKey]: admin.firestore.Timestamp.now(),
      };
      if (status === order_status.order_accepted) {
        updateData.timeEstimated = timeEstimated ? new admin.firestore.Timestamp(timeEstimated.seconds, timeEstimated.nanoseconds) : order.timePlaced;
        updateData.timePickupForQuery = updateData.timeEstimated;
        order.timeEstimated = updateData.timeEstimated;
      }
      await transaction.update(orderRef, updateData);
      return { success: true, order };
    });

    const orderData = result.order;
    // sendSMS is always true
    if (orderData.sendSMS && msgKey) {
      const params = {};
      if (status === order_status.order_accepted || status === order_status.ready_to_pickup) {
        params["time"] = moment(orderData.timeEstimated.toDate()).tz(utils.timezone).locale("ja").format("LLL");
        console.log("timeEstimated", params["time"]);
      }
      await sendMessageToCustomer(db, msgKey, restaurant.restaurantName, orderData, restaurantId, orderId, params);
    }
    return { result: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
