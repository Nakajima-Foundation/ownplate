import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import moment from "moment-timezone";

import { order_status } from "../../common/constant";
import * as utils from "../../lib/utils";
import { notifyNewOrderToRestaurant } from "../notify";
import { costCal } from "../../common/commonUtils";
import { Context } from "../../models/TestType";

import { orderPlacedData } from "../../lib/types";
import { validateOrderPlaced, validateCustomer } from "../../lib/validator";

export const updateOrderTotalDataAndUserLog = async (db, transaction, customerUid, order, restaurantId, ownerUid, timePlaced, now, positive) => {
  const timezone = (functions.config() && functions.config().order && functions.config().order.timezone) || "Asia/Tokyo";

  const menuIds = Object.keys(order);
  const date = moment(timePlaced.toDate()).tz(timezone).format("YYYYMMDD");

  // Firestore transactions require all reads to be executed before all writes.

  // Read !!
  const totalRef: { [key: string]: any } = {};
  const totals: { [key: string]: any } = {};
  const nums: { [key: string]: number } = {};
  await Promise.all(
    menuIds.map(async (menuId) => {
      const numArray = Array.isArray(order[menuId]) ? order[menuId] : [order[menuId]];
      nums[menuId] = numArray.reduce((sum, current) => {
        return sum + current;
      }, 0);
      const path = `restaurants/${restaurantId}/menus/${menuId}/orderTotal/${date}`;
      totalRef[menuId] = db.doc(path);
      totals[menuId] = (await transaction.get(totalRef[menuId])).data();
    })
  );

  const userLogPath = `restaurants/${restaurantId}/userLog/${customerUid}`;
  const userLogRef = db.doc(userLogPath);
  const userLog = (await transaction.get(userLogRef)).data();

  // Write!!
  await Promise.all(
    menuIds.map(async (menuId) => {
      const num = nums[menuId];
      const total = totals[menuId];
      if (!total) {
        const addData = {
          uid: ownerUid,
          restaurantId,
          menuId,
          date,
          count: num,
        };
        await transaction.set(totalRef[menuId], addData);
      } else {
        const count = positive ? total.count + num : total.count - num;
        const updateData = {
          count,
        };
        await transaction.update(totalRef[menuId], updateData);
      }
    })
  );
  if (!userLog) {
    const data = {
      uid: customerUid,
      counter: positive ? 1 : 0,
      cancelCounter: positive ? 0 : 1,
      currentOrder: timePlaced,
      // lastOrder: timePlaced,
      restaurantId,
      ownerUid,
      updateAt: now,
    };
    await transaction.set(userLogRef, data);
  } else {
    const counter = userLog.counter + (positive ? 1 : 0);
    const cancelCounter = userLog.cancelCounter + (positive ? 0 : 1);
    const updateData = {
      counter,
      cancelCounter,
      currentOrder: timePlaced,
      lastOrder: userLog.currentOrder || timePlaced,
      updateAt: now,
      lastUpdatedAt: userLog.updateAt || new admin.firestore.Timestamp(1577804400, 0),
    };
    await transaction.update(userLogRef, updateData);
  }
};

const multiple = utils.getStripeRegion().multiple; // 100 for USD, 1 for JPY

// This function is called by users to place orders without paying
// export const place = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
export const place = async (db, data: orderPlacedData, context: functions.https.CallableContext | Context) => {
  const customerUid = utils.validate_auth(context);

  const { restaurantId, orderId, tip, sendSMS, timeToPickup, lng, memo, customerInfo } = data;
  utils.required_params({ restaurantId, orderId }); // tip, sendSMS and lng are optinoal

  const validateResult = validateOrderPlaced(data);
  if (!validateResult.result) {
    console.error("orderPlace", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  const _tip = Number(tip) || 0;
  const roundedTip = Math.round(_tip * multiple) / multiple;
  const now = admin.firestore.Timestamp.now();

  const timePlaced = (timeToPickup && new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds)) || admin.firestore.FieldValue.serverTimestamp();
  try {
    const restaurantData = await utils.get_restaurant(db, restaurantId);

    const postage = restaurantData.isEC ? await utils.get_restaurant_postage(db, restaurantId) : {};

    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
    const customerRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/customer/data`);

    const result = await db.runTransaction(async (transaction) => {
      const order = (await transaction.get(orderRef)).data();
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      order.id = orderId;
      if (customerUid !== order.uid) {
        throw new functions.https.HttpsError("permission-denied", "The user is not the owner of this order.");
      }
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError("failed-precondition", "The order has been already placed or canceled");
      }
      const hasCustomer = restaurantData.isEC || order.isDelivery;
      
      if (hasCustomer) {
        const validateResult = validateCustomer(customerInfo || {})
        if (!validateResult.result) {
          console.error("orderPlace", validateResult.errors);
          throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
        }
        // for transaction lock
        await transaction.get(customerRef);
      }
      // transaction for stock orderTotal
      await updateOrderTotalDataAndUserLog(db, transaction, customerUid, order.order, restaurantId, restaurantData.uid, timePlaced, now, true);
      const shippingCost = restaurantData.isEC ? costCal(postage, customerInfo?.prefectureId, order.total) : 0;

      const totalCharge = order.total + roundedTip + (shippingCost || 0) + (order.deliveryFee || 0);

      if (hasCustomer) {
        const {
          zip,
          prefectureId,
          address,
          name,
          email,
        } = customerInfo;
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
      // customerUid
      await transaction.update(orderRef, {
        status: order_status.order_placed,
        totalCharge,
        tip: roundedTip,
        shippingCost,
        sendSMS: sendSMS || false,
        updatedAt: now,
        orderPlacedAt: now,
        timePlaced,
        timePickupForQuery: timePlaced,
        memo: memo || "",
        isEC: restaurantData.isEC || false,
      });
      Object.assign(order, { totalCharge, tip, shippingCost });
      return { success: true, order };
    });

    await notifyNewOrderToRestaurant(db, restaurantId, result.order, restaurantData.restaurantName, lng);

    return result;
  } catch (error) {
    throw utils.process_error(error);
  }
};
