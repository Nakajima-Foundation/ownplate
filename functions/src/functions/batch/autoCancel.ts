import * as admin from "firebase-admin";
import { order_status } from "../../common/constant";
import * as utils from "../../lib/utils";
import { updateOrderTotalDataAndUserLog } from "../order/orderPlace";
import { cancelStripe } from "../stripe/intent";
import { sendMessageToCustomer } from "../notify";

import { autoCancels } from "../../common/project";

import moment from "moment-timezone";

export const cancelOrder = async (db: admin.firestore.Firestore, restaurantId: string, orderId: string) => {
  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
  const restaurant = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurant["uid"];
  
  const result = await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    const order = orderDoc.data();
    if (!order) {
      return;
    };
    const updateDataBase = {
      timeCanceled: admin.firestore.FieldValue.serverTimestamp(),
      timeAutoCanceled: admin.firestore.FieldValue.serverTimestamp(),
      orderRestaurantCanceledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: order_status.order_canceled,
      cancelReason: "autoCancel",
    };
    const noPayment = !order.payment || !order.payment.stripe;
    const hasPayment = !noPayment;
    if (hasPayment && order.payment.stripe !== "pending") {
      return;
    }
    const paymentIntent = hasPayment ? await cancelStripe(db, transaction, stripeRef, restaurantOwnerUid, orderId) : {}; // stripe
    await updateOrderTotalDataAndUserLog(db, transaction, order.uid, order.order, restaurantId, restaurantOwnerUid, order.timePlaced, false);
    const updateData = noPayment ? updateDataBase : {
      ...updateDataBase,
      ...{
        payment: {
          stripe: "canceled",
        },
      }
    };
    transaction.set(orderRef, updateData, { merge: true });
    if (hasPayment) { // stripe
      transaction.set(
        stripeRef,
        {
          paymentIntent,
        },
        { merge: true }
      );
    }
    return {
      order,
    };
  });
  if (result) {
    await sendMessageToCustomer(db, "msg_order_canceled", restaurant.restaurantName, result.order, restaurantId, orderId, {}, true);
  }
}


const autoCancelGroup = async (groupId) => {
  const yesterday = moment().add(-5, 'days');
  const db = admin.firestore();
  const collection = await db.collectionGroup("orders")
        .where("groupId", "==", groupId)
        .where("status", "==", 300)
        .where("timeCreated", ">", yesterday.toDate())
        .limit(10).get()

  await Promise.all(collection.docs.map(async (res) => {
    // console.log(res.data());
    const data = res.data();
    const [,restaurantId,,orderId] = res.ref.path.split("/");
    
    const diffSecond = data.isPickup ? 10 * 60 : 3600 * 24;

    if ((moment().unix() - moment(data.orderPlacedAt.toDate()).unix()) > diffSecond) {
      // console.log(data);
      console.log(restaurantId, orderId);
      await cancelOrder(db, restaurantId, orderId)
    }
  }));
  
};

export const autoCancel = async () => {
  await Promise.all(autoCancels.map(async (groupId) => { 
    await autoCancelGroup(groupId)
  }));
};

