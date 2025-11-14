import { HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { PromotionData } from "../../lib/types/promotion";
import { RestaurantInfoData } from "../../models/RestaurantInfo";

export const getPromotion = async (db: admin.firestore.Firestore, transaction: admin.firestore.Transaction, promotionId: string, restaurantData: RestaurantInfoData, orderTotal: number, enableStripe: boolean): Promise<PromotionData> => {
  // get promotion
  const promotionPath = `restaurants/${restaurantData.restaurantId}/promotions/${promotionId}`;
  const promotionDoc = await transaction.get(db.doc(promotionPath));

  if (!promotionDoc) {
    throw new HttpsError("invalid-argument", "No promotion exist.");
  }

  const promotionData = promotionDoc.data() as PromotionData | undefined;

  if (!promotionData) {
    throw new HttpsError("invalid-argument", "No promotion exist.");
  }

  if (!promotionData.enable) {
    throw new HttpsError("invalid-argument", "No promotion exist.");
  }
  const now = new Date();
  if (promotionData.hasTerm) {
    if (promotionData.termFrom && promotionData.termFrom.toDate() > now) {
      throw new HttpsError("invalid-argument", "No promotion exist.");
    }
    if (promotionData.termTo && now > promotionData.termTo.toDate()) {
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

export const getUserHistoryDoc = async (db: admin.firestore.Firestore, promotionData: PromotionData, uid: string) => {
  const collectionPath = getUserHistoryCollectionPath(uid);
  if (promotionData.type === "multipletimesCoupon") {
    const ret = (await db.collection(collectionPath).where("promotionId", "==", promotionData.promotionId).where("used", "==", false).orderBy("createdAt", "asc").limit(1).get())
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

export const enableUserPromotion = async (transaction: admin.firestore.Transaction, promotionData: PromotionData, userPromotionRef: admin.firestore.DocumentReference) => {
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
  promotionData: PromotionData,
  restaurantData: RestaurantInfoData,
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

export const getDiscountPrice = (promotion: PromotionData, total: number) => {
  if (promotion.discountMethod === "amount") {
    return promotion.discountValue;
  } else {
    return Number((promotion.discountValue * total) / 100);
  }
};
