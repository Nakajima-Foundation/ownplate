import Stripe from "stripe";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import moment from "moment-timezone";

import { order_status } from "../../common/constant";
import * as utils from "../../lib/utils";
import { notifyNewOrderToRestaurant } from "../notify";
import { costCal } from "../../common/commonUtils";
import { Context } from "../../models/TestType";

import { getStripeAccount, /* getPaymentMethodData, */ getHash, /* getCustomerStripeInfo2, saveCustomerStripeInfo2 */ } from "../stripe/intent";
import { orderPlacedData } from "../../lib/types";
import { validateOrderPlaced, validateCustomer } from "../../lib/validator";

import { getPromotion, enableUserPromotion, userPromotionHistoryData, getUserHistoryDoc, getUserHistoryCollectionPath, getDiscountPrice } from "./promotion";

export const getOrderData = async (transaction: admin.firestore.Transaction, orderRef: admin.firestore.DocumentReference) => {
  const orderDoc = await transaction.get(orderRef);
  const order = orderDoc.data();
  if (!order) {
    throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
  }
  order.id = orderDoc.id;
  return order;
};

export const updateOrderTotalDataAndUserLog = async (
  db: admin.firestore.Firestore,
  transaction: admin.firestore.Transaction,
  customerUid: string,
  order: any,
  restaurantId: string,
  ownerUid: string,
  timePlaced,
  positive: boolean,
) => {
  const menuIds = Object.keys(order);
  console.log(utils.timezone);
  const date = moment(timePlaced.toDate()).tz(utils.timezone).format("YYYYMMDD");

  // Firestore transactions require all reads to be executed before all writes.

  // Read !!
  const totalRef: { [key: string]: admin.firestore.DocumentReference } = {};
  const totals: { [key: string]: admin.firestore.DocumentData | undefined } = {};
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
    }),
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
    }),
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
      updateAt: admin.firestore.FieldValue.serverTimestamp(),
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
      updateAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdatedAt: userLog.updateAt || new admin.firestore.Timestamp(1577804400, 0),
    };
    await transaction.update(userLogRef, updateData);
  }
};

const multiple = utils.stripeRegion.multiple; // 100 for USD, 1 for JPY

// This function is called by users to place orders without paying
export const place = async (db, data: orderPlacedData, context: functions.https.CallableContext | Context) => {
  const customerUid = utils.validate_customer_auth(context);

  const { restaurantId, orderId, tip, timeToPickup, memo, userName, customerInfo, payStripe, waitingPayment } = data;
  // const { promotionId, affiliateId } = data;
  const { promotionId } = data;
  utils.required_params({ restaurantId, orderId }); // tip is optinoal

  const validateResult = validateOrderPlaced(data);
  if (!validateResult.result) {
    console.error("orderPlace", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }
  const enableStripe = !!payStripe;

  const roundedTip = Math.round((Number(tip) || 0) * multiple) / multiple;
  if (roundedTip < 0) {
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }
  // In isEC, timeToPickup is now. else time to pick
  const timePlaced = new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds);

  try {
    const restaurantData = await utils.get_restaurant(db, restaurantId);
    const restaurantOwnerUid = restaurantData["uid"];
    const postage = restaurantData.isEC ? await utils.get_restaurant_postage(db, restaurantId) : {};

    // check tip
    if ((restaurantData.groupId || restaurantData.isEC) && roundedTip > 0) {
      throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
    }
    // check time
    if (!restaurantData.isEC) {
      if (timePlaced.toDate() < new Date()) {
        throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
      }
    }

    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
    const customerRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/customer/data`);

    const result = await db.runTransaction(async (transaction) => {
      const order = await getOrderData(transaction, orderRef);
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      if (customerUid !== order.uid) {
        throw new functions.https.HttpsError("permission-denied", "The user is not the owner of this order.");
      }
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError("failed-precondition", "The order has been already placed or canceled");
      }
      // promotion
      const { historyCollectionRef, historyDocRef, promotionData, discountPrice } = await (async () => {
        if (promotionId) {
          const promotionData = await getPromotion(db, transaction, promotionId, restaurantData, order.total, enableStripe);
          const discountPrice = getDiscountPrice(promotionData, order.total);
          if (promotionData.usageRestrictions) {
            const historyDocRef = await getUserHistoryDoc(db, promotionData, customerUid);
            if (!(await enableUserPromotion(transaction, promotionData, historyDocRef))) {
              throw new functions.https.HttpsError("invalid-argument", "This promotion is used.");
            }
            return {
              historyDocRef,
              promotionData,
              discountPrice,
            };
          }
          const historyCollectionRef = db.collection(getUserHistoryCollectionPath(customerUid));
          return {
            historyCollectionRef,
            promotionData,
            discountPrice,
          };
        }
        return {
          discountPrice: 0,
        };
      })();

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

      const totalCharge = order.total + roundedTip + (shippingCost || 0) + (order.deliveryFee || 0) - discountPrice;
      const totalChargeWithTipAndMultipled = totalCharge * multiple; // for US stripe price
      const orderNumber = utils.nameOfOrder(order.number);
      const paymentIntent = await (async () => {
        if (enableStripe) {
          // We expect that there is a customer Id associated with a token
          // const payment_method_data = await getPaymentMethodData(db, restaurantOwnerUid, customerUid);

          const description = `#${orderNumber} ${restaurantData.restaurantName} ${restaurantData.phoneNumber}`;
          const request = {
            setup_future_usage: "off_session",
            capture_method: "manual",
            amount: totalChargeWithTipAndMultipled,
            description: `${description} ${orderId}`,
            currency: utils.stripeRegion.currency,
            metadata: { uid: customerUid, restaurantId, orderId },
            // payment_method_data,
          } as Stripe.PaymentIntentCreateParams;
          // const stripeCustomer = await getCustomerStripeInfo2(db, customerUid, restaurantOwnerUid);
          const stripe = utils.get_stripe();
          const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);
          /*
          if (stripeCustomer && stripeCustomer.customerId) {
            request.customer = stripeCustomer.customerId;
          } else {
            const customer = await stripe.customers.create({}, {stripeAccount});
            await saveCustomerStripeInfo2(db, customerUid, restaurantOwnerUid, { customerId: customer.id});
          }
          */
          const idempotencyKey = getHash([orderRef.path, /* payment_method_data.card.token */ ].join("-"));
          const ret = await stripe.paymentIntents.create(request, {
            idempotencyKey,
            stripeAccount,
          });
          /*
          if (stripeCustomer && stripeCustomer.customerId) {
            await stripe.paymentIntents.capture(ret.id, {
              stripeAccount,
            });
          }
          */
          return ret;
        }
        return { client_secret: ""};
      })();
      
      
      const { client_secret } = paymentIntent;
      // transaction for stock orderTotal
      await updateOrderTotalDataAndUserLog(db, transaction, customerUid, order.order, restaurantId, restaurantOwnerUid, timePlaced, true);
      // update customer
      if (hasCustomer) {
        const { zip, prefectureId, prefecture, address, name, email, location } = customerInfo;
        await transaction.set(customerRef, {
          zip,
          prefectureId,
          prefecture: prefecture || "",
          address,
          location: location || {},
          name,
          email: email || "",
          uid: customerUid,
          orderId,
          restaurantId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      // customerUid
      const updateData = {
        status: waitingPayment ? order_status.waiting_payment : order_status.order_placed,
        totalCharge,
        discountPrice,
        promotionName: promotionData?.promotionName || "",
        promotionId: promotionId || "",
        tip: roundedTip,
        shippingCost,
        sendSMS: true,
        printed: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        timePlaced,
        timePickupForQuery: timePlaced,
        client_secret,
        memo: memo || "",
        isEC: restaurantData.isEC || false,
      } as any;
      if (userName) {
        updateData.name = userName;
      }
      if (!waitingPayment) {
        updateData.orderPlacedAt = admin.firestore.FieldValue.serverTimestamp();
      }
      if (enableStripe) {
        const update = {
          ...updateData,
          description: `#${orderNumber} ${restaurantData.restaurantName} ${restaurantData.phoneNumber}`,
          payment: {
            stripe: "pending",
          },
        };
        await transaction.update(orderRef, update);
        const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
        await transaction.set(
          stripeRef,
          {
            paymentIntent,
          },
          { merge: true },
        );
      } else {
        await transaction.update(orderRef, updateData);
      }
      // promotion
      if (historyDocRef) {
        const data = userPromotionHistoryData(promotionData, restaurantData, customerUid, orderId, totalCharge, discountPrice, enableStripe);
        await transaction.set(historyDocRef, data);
      } else if (historyCollectionRef) {
        const data = userPromotionHistoryData(promotionData, restaurantData, customerUid, orderId, totalCharge, discountPrice, enableStripe);
        console.log(data);
        await transaction.set(historyCollectionRef.doc(), data);
      }

      Object.assign(order, { totalCharge, tip, shippingCost }, enableStripe ? { payment: true } : {});
      return { success: true, order };
    });
    if (!waitingPayment) {
      await notifyNewOrderToRestaurant(db, restaurantId, result.order, restaurantData.restaurantName);
    }
    return { result: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
