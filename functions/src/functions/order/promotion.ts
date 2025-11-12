import { HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const getPromotion = async (db, transaction, promotionId, restaurantData, orderTotal, enableStripe) => {
  // get promotion
  const promotionPath = `restaurants/${restaurantData.restaurantId}/promotions/${promotionId}`;
  const promotionDoc = await transaction.get(db.doc(promotionPath));

  if (!promotionDoc) {
    throw new HttpsError("invalid-argument", "No promotion exist.");
  }

  const promotionData = promotionDoc.data();

  if (!promotionData.enable) {
    throw new HttpsError("invalid-argument", "No promotion exist.");
  }
  const now = new Date();
  if (promotionData.hasTerm) {
    if (promotionData.termFrom.toDate() > now) {
      throw new HttpsError("invalid-argument", "No promotion exist.");
    }
    if (now > promotionData.termTo.toDate()) {
      throw new HttpsError("invalid-argument", "No promotion exist.");
    }
  }
  if (promotionData.discountThreshold > orderTotal) {
    throw new HttpsError("invalid-argument", "No promotion exist.");
  }
  if (promotionData.paymentRestrictions) {
    if (promotionData.paymentRestrictions === "stripe" && !enableStripe) {
      throw new HttpsError("invalid-argument", "No promotion exist.");
    }
    if (promotionData.paymentRestrictions === "instore" && enableStripe) {
      throw new HttpsError("invalid-argument", "No promotion exist.");
    }
  }
  // coupon is ok
  return promotionData;
};

export const getUserHistoryCollectionPath = (uid: string) => {
  return `/users/${uid}/promotionHistories`;
};

export const getUserHistoryDoc = async (db, promotionData, uid) => {
  const collectionPath = getUserHistoryCollectionPath(uid);
  if (promotionData.type === "multipletimesCoupon") {
    const ret = (await db.collection(collectionPath).where("promotionId", "===", promotionData.promotionId).where("used", "===", false).orderBy("createdAt", "asc").limit(1).get())
      .docs[0];
    if (ret) {
      const path = `${collectionPath}/${ret.id}`;
      return db.doc(path);
    }
  } else {
    const path = `${collectionPath}/${promotionData.promotionId}`;
    return db.doc(path);
  }
  throw new HttpsError("invalid-argument", "No promotion exist.");
};

export const enableUserPromotion = async (transaction: admin.firestore.Transaction, promotionData: any, userPromotionRef: admin.firestore.DocumentReference) => {
  const ret = (await transaction.get(userPromotionRef)).data();

  if (promotionData.type === "multipletimesCoupon" || promotionData.type === "onetimeCoupon") {
    if (ret) {
      return !ret.used;
    }
    return false;
  }
  if (promotionData.type === "discount") {
    return !ret;
  }
  throw new HttpsError("invalid-argument", "No promotion exist.");
};

export const userPromotionHistoryData = (
  promotionData: any,
  restaurantData: any,
  customerUid: string,
  orderId: string,
  totalCharge: number,
  discountPrice: number,
  enableStripe: boolean,
) => {
  return {
    uid: customerUid,
    restaurantId: restaurantData.restaurantId,
    promotionId: promotionData.promotionId,
    orderId,
    totalCharge,
    discountPrice,
    isStripe: enableStripe,
    used: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    usedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
};

export const getDiscountPrice = (promotion: any, total: number) => {
  if (promotion.discountMethod === "amount") {
    return promotion.discountValue;
  } else {
    return Number((promotion.discountValue * total) / 100);
  }
};
