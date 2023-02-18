import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const getPromotion = async (db, transaction, promotionId, restaurantData, orderTotal, enableStripe) => {
  // get promotion
  const promotionPath = (restaurantData.groupId) ?
    `/groups/${restaurantData.groupId}/promotions/${promotionId}` :
    `restaurants/${restaurantData.restaurantId}/promotions/${promotionId}`;
  const promotionDoc = await transaction.get(db.doc(promotionPath));

  if (!promotionDoc) {
    throw new functions.https.HttpsError("invalid-argument", "No promotion exist.");
  }

  const promotionData = promotionDoc.data();

  if (!promotionData.enable) {
    throw new functions.https.HttpsError("invalid-argument", "No promotion exist.");
  }
  const now = new Date();
  if (promotionData.hasTerm) {
    if (promotionData.termFrom.toDate() > now) {
      throw new functions.https.HttpsError("invalid-argument", "No promotion exist.");
    }
    if (now > promotionData.termTo.toDate()) {
      throw new functions.https.HttpsError("invalid-argument", "No promotion exist.");
    }
  }
  if (promotionData.discountThreshold> orderTotal) {
    throw new functions.https.HttpsError("invalid-argument", "No promotion exist.");
  }
  if (promotionData.paymentRestrictions) {
    if (promotionData.paymentRestrictions === "stripe" && !enableStripe) {
      throw new functions.https.HttpsError("invalid-argument", "No promotion exist.");
    }
    if (promotionData.paymentRestrictions === "instore" && enableStripe) {
      throw new functions.https.HttpsError("invalid-argument", "No promotion exist.");
    }
  }
  // coupon is ok
  return promotionData;
}



export const getUserPromotionRef = async (db, promotionData, uid) => {
  if (promotionData.type === "multipletimesCoupon") {
    const path = `/users/${uid}/promotionsHistory`;
    const ret = (await db.collection(path)
      .where("promotionId", "===", promotionData.promotionId)
      .where("used", "===", false)
      .orderBy("createdAt", "asc")
      .limit(1)
      .get()).docs[0];
    if (ret) {
      return ret.ref;
    }
  } else {
    const path = `/users/${uid}/promotionsHistory/${promotionData.promotionId}`;
    return db.doc(path);
  }
  throw new functions.https.HttpsError("invalid-argument", "No promotion exist.");
}


export const enableUserPromotion = async (transaction: any, promotionData: any, userPromotionRef: any) => {
  const ret = (await transaction.get(userPromotionRef)).data()

  if (promotionData.type === "multipletimesCoupon" ||
    promotionData.type === "onetimeCoupon") {
    if (ret) {
      return !ret.used
    }
    return false;
  }
  if (promotionData.type === "discount") {
    return !ret
  }
  throw new functions.https.HttpsError("invalid-argument", "No promotion exist.");
}

export const setUserPromotionUsed = async (transaction: any, promotionData: any, userPromotionRef: any, restaurantData: any, customerUid: string) => {
  if (promotionData.type === "multipletimesCoupon" ||
    promotionData.type === "onetimeCoupon") {
    await transaction.set(userPromotionRef, {
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  if (promotionData.type === "discount") {
    await transaction.set(userPromotionRef, {
      uid: customerUid,
      restaurantId: restaurantData.restaurantId,
      groupId: restaurantData.groupId,
      promotionId: promotionData.promotionId,
      used: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
};

export const getDiscountPrice = (promotion: any, total: number) => {
  if (promotion.discountMethod === 'amount') {
    return promotion.discountValue;
  } else {
    return Number(promotion.discountValue * total / 100);
  }
};