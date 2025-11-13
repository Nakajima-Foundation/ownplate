import Stripe from "stripe";
import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

import { order_status } from "../../common/constant";
import * as utils from "../../lib/utils";
import { orderAccounting, createNewOrderData } from "../order/orderCreated";
import { sendMessageToCustomer } from "../notify2";
import { costCal } from "../../utils/commonUtils";
import { getStripeAccount, getStripeOrderRecord, getPaymentMethodData, getHash } from "./intent";

import { orderChangeData, newOrderData } from "../../lib/types";
import { validateOrderChange } from "../../lib/validator";

type OrderQuantityMap = Record<string, number[]>;
type OrderOptionsMap = Record<string, Record<number, unknown>>;

const multiple = utils.stripeRegion.multiple; // 100 for USD, 1 for JPY

const getUpdateOrder = (
  newOrders: newOrderData[],
  order: OrderQuantityMap,
  options: OrderOptionsMap,
  rawOptions: OrderOptionsMap,
) => {
  const updateOrderData: OrderQuantityMap = {};
  const updateOptions: OrderOptionsMap = {};
  const updateRawOptions: OrderOptionsMap = {};

  newOrders.forEach((data) => {
    const { menuId, index } = data;
    if (!utils.isEmpty(order[menuId]) && !utils.isEmpty(order[menuId][index])) {
      if (utils.isEmpty(updateOrderData[menuId])) {
        updateOrderData[menuId] = [];
        updateOptions[menuId] = {};
        updateRawOptions[menuId] = {};
      }
      updateOrderData[menuId].push(order[menuId][index]);
      const optionIndex = updateOrderData[menuId].length - 1;
      updateOptions[menuId][optionIndex] = options[menuId][index];
      updateRawOptions[menuId][optionIndex] = rawOptions[menuId][index];
    }
  });

  return {
    updateOrderData,
    updateOptions,
    updateRawOptions,
  };
};

export const orderChange = async (db: admin.firestore.Firestore, data: orderChangeData, context: CallableRequest) => {
  const ownerUid = utils.validate_owner_admin_auth(context);
  const uid = utils.validate_auth(context);
  const { restaurantId, orderId, newOrder } = data;
  utils.required_params({ restaurantId, orderId, newOrder });

  const validateResult = validateOrderChange(data);
  if (!validateResult.result) {
    console.error("createIntent", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  if (utils.is_subAccount(context)) {
    await utils.validate_sub_account_request(db, uid, ownerUid, restaurantId);
  }
  const restaurantRef = db.doc(`restaurants/${restaurantId}`);
  const restaurantData = await utils.get_restaurant(db, restaurantId);
  if (restaurantData.uid !== ownerUid) {
    throw new HttpsError("permission-denied", "The user does not have an authority to perform this operation.");
  }
  if (newOrder.length === 0) {
    throw new HttpsError("permission-denied", "Cannot be changed to an empty order.");
  }
  // check mo
  const menuRestaurantRef = restaurantRef;

  try {
    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
    const orderSnapshot = await orderRef.get();
    const order = orderSnapshot.data();
    if (!order) {
      throw new HttpsError("invalid-argument", "This order does not exist.");
    }

    if (!utils.isEmpty(order.orderUpdatedAt) || order.status !== order_status.order_placed) {
      throw new HttpsError("failed-precondition", "It is not possible to change the order.");
    }

    // generate new order
    order.id = orderId;
    const orderDetails = order as unknown as {
      order: OrderQuantityMap;
      options: OrderOptionsMap;
      rawOptions: OrderOptionsMap;
    };

    const { updateOrderData, updateOptions, updateRawOptions } = getUpdateOrder(newOrder, orderDetails.order, orderDetails.options, orderDetails.rawOptions);

    // update price
    const baseData = {
      order: updateOrderData,
      rawOptions: updateRawOptions,
    };
    const res = await createNewOrderData(menuRestaurantRef, orderRef, baseData, multiple);
    if (!res.result) {
      throw new HttpsError("permission-denied", "unknown error.");
    }
    const { newOrderData, newItems, newPrices, food_sub_total, alcohol_sub_total } = res.data;

    const accountingResult = orderAccounting(restaurantData, food_sub_total, alcohol_sub_total, multiple);
    // was created new order data

    const deliveryData = order.isDelivery ? await utils.get_restaurant_delivery_area(db, restaurantId) : {};
    const deliveryFee = utils.get_delivery_cost(order, deliveryData, accountingResult.total);

    const postage = restaurantData.isEC ? await utils.get_restaurant_postage(db, restaurantId) : {};
    const shippingCost = restaurantData.isEC ? costCal(postage, order?.customerInfo?.prefectureId, accountingResult.total) : 0;

    const orderUpdateData = {
      order: newOrderData,
      menuItems: newItems,
      prices: newPrices,
      options: updateOptions,
      rawOptions: updateRawOptions,
      sub_total: accountingResult.sub_total,
      tax: accountingResult.tax,
      inclusiveTax: accountingResult.inclusiveTax,
      total: accountingResult.total,
      totalCharge: accountingResult.total + (Number(order.tip) || 0) + (shippingCost || 0) + (deliveryFee || 0),
      shippingCost,
      deliveryFee,
      accounting: {
        food: {
          revenue: accountingResult.food_sub_total,
          tax: accountingResult.food_tax,
        },
        alcohol: {
          revenue: accountingResult.alcohol_sub_total,
          tax: accountingResult.alcohol_tax,
        },
      },
      orderUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!order.payment) {
      console.error("[orderChange] no payment", orderUpdateData);
      orderRef.update(orderUpdateData);
    } else {
      // update stripe
      await db.runTransaction(async (transaction) => {
        const customerUid = order.uid;
        const restaurantOwnerUid = restaurantData["uid"];
        const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);

        const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
        await getStripeOrderRecord(transaction, stripeRef);

        (await transaction.get(orderRef)).data();

        // get System Stripe
        const payment_method_data = await getPaymentMethodData(db, restaurantOwnerUid, customerUid);

        const description = `#${order.number} ${restaurantData.restaurantName} ${order.phoneNumber}`;
        const request = {
          setup_future_usage: "off_session",
          amount: orderUpdateData.totalCharge * multiple,
          description: `${description} ${orderId} orderChange`,
          currency: utils.stripeRegion.currency,
          metadata: { uid: customerUid, restaurantId, orderId },
          payment_method_data,
        } as Stripe.PaymentIntentCreateParams;
        const hash = getHash(JSON.stringify(newOrderData));

        const stripe = utils.get_stripe_v2();
        const paymentIntent = await stripe.paymentIntents.create(request, {
          idempotencyKey: orderRef.path + hash,
          stripeAccount,
        });

        await transaction.update(orderRef, orderUpdateData);

        await transaction.set(
          stripeRef,
          {
            paymentIntent,
          },
          { merge: true },
        );
        return {};
      });
    }
    if (order.sendSMS) {
      await sendMessageToCustomer(db, "msg_order_updated", restaurantData.hasLine, restaurantData.restaurantName, order, restaurantId, orderId, {}, true);
    }
    return { result: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
