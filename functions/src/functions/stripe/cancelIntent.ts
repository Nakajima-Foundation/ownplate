import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

import { order_status } from "../../common/constant";
import * as utils from "../../lib/utils";
import { updateOrderTotalDataAndUserLog } from "../order/orderPlace";
import { sendMessageToCustomer, notifyCanceledOrderToRestaurant } from "../notify2";

import { cancelStripe } from "./intent";
import { validateCancel } from "../../lib/validator";
import { orderCancelData } from "../../lib/types";

// This function is called by user or admin to cancel an exsting order (before accepted by admin)
export const cancel = async (db: admin.firestore.Firestore, data: orderCancelData, context: CallableRequest) => {
  const isAdmin = utils.is_admin_auth(context);

  const uid = isAdmin ? utils.validate_owner_admin_auth(context) : utils.validate_customer_auth(context);

  const { restaurantId, orderId, cancelReason } = data;
  utils.required_params({ restaurantId, orderId });

  const validateResult = validateCancel(data);
  if (!validateResult.result) {
    console.error("cancel", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  if (utils.is_subAccount(context)) {
    const adminUid = utils.validate_auth(context);
    await utils.validate_sub_account_request(db, adminUid, uid, restaurantId);
  }

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
  const restaurantData = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurantData.uid;

  try {
    const result = await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      const order = orderDoc.data();
      if (!order) {
        throw new HttpsError("invalid-argument", "This order does not exist.");
      }
      order.id = orderDoc.id;
      if (isAdmin) {
        // Admin can cancel it before confirmed
        if (uid !== restaurantOwnerUid || order.status >= order_status.ready_to_pickup) {
          throw new HttpsError("permission-denied", "Invalid order state to cancel.");
        }
      } else {
        // User can cancel an order before accepted
        if (uid !== order.uid || order.status !== order_status.order_placed) {
          throw new HttpsError("permission-denied", "Invalid order state to cancel.");
        }
      }
      const cancelTimeKey = uid === order.uid ? "orderCustomerCanceledAt" : "orderRestaurantCanceledAt";
      // user can cancel if restaurant cancel just only payment and status is placed.
      const myCancelReason = isAdmin ? cancelReason || null : "canceledByCustomer";
      const updateDataBase = {
        timeCanceled: admin.firestore.FieldValue.serverTimestamp(),
        [cancelTimeKey]: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: order_status.order_canceled,
        cancelReason: myCancelReason,
        uidCanceledBy: uid,
      };
      const noPayment = !order.payment || !order.payment.stripe || (!isAdmin && order.payment.stripe === "canceled");
      const hasPayment = !noPayment;
      if (hasPayment && order.payment.stripe !== "pending") {
        throw new HttpsError("permission-denied", "Invalid payment state to cancel."); // stripe
      }
      const paymentIntent = hasPayment ? await cancelStripe(db, transaction, stripeRef, restaurantOwnerUid, order.id) : {}; // stripe
      await updateOrderTotalDataAndUserLog(db, transaction, order.uid, order.order, restaurantId, restaurantOwnerUid, order.timePlaced, false);
      const updateData = noPayment
        ? updateDataBase
        : {
          ...updateDataBase,
          ...{
            payment: {
              stripe: "canceled",
            },
          },
        };
      transaction.set(orderRef, updateData, { merge: true });
      if (hasPayment) {
        // stripe
        transaction.set(
          stripeRef,
          {
            paymentIntent,
          },
          { merge: true },
        );
      }
      Object.assign(order, updateData);
      return {
        success: true,
        payment: hasPayment ? "stripe" : false,
        byUser: uid === order.uid, // no longer used?
        order,
      };
    });
    // sendSMS is always true
    if (isAdmin && result.order.sendSMS) {
      await sendMessageToCustomer(db, "msg_order_canceled", restaurantData.hasLine, restaurantData.restaurantName, result.order, restaurantId, orderId, {}, true);
    }
    if (!isAdmin) {
      await notifyCanceledOrderToRestaurant(db, restaurantId, result.order, restaurantData.restaurantName);
    }
    return { result: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
