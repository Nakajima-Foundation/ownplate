import express from "express";
import * as admin from "firebase-admin";
// import { ownPlateConfig } from "../../common/project";
// import cors from "cors";
// import * as Sentry from "@sentry/node";

import { nameOfOrder, timezone } from "../../lib/utils";

import { validateFirebaseId } from "../../lib/validator";
import { order_status } from "../../common/constant";
import moment from "moment-timezone";
import * as receiptline from "receiptline";
// import { convert } from 'convert-svg-to-png';
import sharp from "sharp";

export const apiRouter = express.Router();

if (!admin.apps.length) {
  admin.initializeApp();
}

let db = admin.firestore();

export const updateDb = (_db) => {
  db = _db;
};

export const response200 = (res, payload) => {
  return res.json({
    result: true,
    payload,
  });
};

export const escapeOptionPrice = (text: string) => {
  const optionPriceRegex = /\(((\+|＋|ー|−)[0-9.]+)\)/g;
  return text.replace(optionPriceRegex, "");
};
export const escapePrinterString = (text: string) => {
  // {}+-|"`^,;:
  return text.replace(/[{}+\-|"`^,;:]+/g, "");
};

export const getSVG = (restaurantData: any, orderData: any) => {
  const orderNumber = nameOfOrder(orderData.number);

  const messages: string[] = [];
  Object.keys(orderData.order).map((menuId) => {
    const menu = orderData.menuItems[menuId];
    const name = menu.itemName;
    return Object.keys(orderData.order[menuId]).map((key) => {
      const count = orderData.order[menuId][key];
      messages.push(`${escapePrinterString(name)} | x${count}`);

      try {
        if (orderData.options && orderData.options[menuId] && orderData.options[menuId][key]) {
          const opts = orderData.options[menuId][key].filter((o) => o);
          if (opts.length > 0) {
            opts.map((opt) => {
              if (opt) {
                messages.push("~~~*" + escapePrinterString(escapeOptionPrice(opt)) + "|");
              }
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  });
  const orders = messages.join("\n");
  const howToReceive = orderData.isDelivery ? "デリバリー" : "テイクアウト";
  const timeEstimated = moment(orderData.timePlaced.toDate()).tz(timezone).format("YYYY/MM/DD HH:mm");
  const taxPayment = restaurantData.inclusiveTax ? "内税" : "外税";
  const onlinePay = orderData?.payment?.stripe ? "事前クレジット決済" : "現地払い";
  const text = `
^^${escapePrinterString(restaurantData.restaurantName || "")}
おもちかえり.com

^^^"${orderNumber}"

|受渡方法："${howToReceive}"
|受渡希望時間："${timeEstimated}"

${escapePrinterString(orderData.name || "")}さん|
{w:*,4;b:line}
${orders}
-
{w:16,16;a:right}
小計 | ¥${orderData.total}
消費税（${taxPayment}） | ¥${orderData.tax || 0}
配達料金 | ¥${orderData.deliveryFee || 0} 
心づけ (サービス料・消費税含む)| ¥${orderData.tip || 0}
-
^^ 合計 | ^^^¥${orderData.totalCharge}
{w:auto; b:space}
支払方法："${onlinePay}"|


`;
  // console.log({text});
  const svg = receiptline.transform(text, { encoding: "cp932" });
  return svg;
};

const common = async (req: any, res: any, next: any) => {
  const { restaurantId, starKey } = req.params;

  if (!validateFirebaseId(restaurantId)) {
    return res.status(404).send("");
  }

  const restaurant = await db.doc(`restaurants/${restaurantId}`).get();
  if (!restaurant || !restaurant.exists) {
    return res.status(404).send("");
  }
  const restaurant_data: any = restaurant.data();
  if (!restaurant_data.publicFlag || restaurant_data.deletedFlag) {
    return res.status(404).send("");
  }

  const restaurantPrinter = await db.doc(`restaurants/${restaurantId}/private/printer`).get();
  if (!restaurantPrinter || !restaurantPrinter.exists) {
    return res.status(400).send("");
  }
  const restaurantPrinterData = restaurantPrinter.data();
  if (!restaurantPrinterData || restaurantPrinterData.key !== starKey) {
    return res.status(400).send("");
  }

  // todo auth
  req.restaurant = restaurant_data;
  next();
};

const pollingStar = async (req: any, res: any) => {
  const { restaurantId } = req.params;
  const { statusCode } = req.body;
  // console.log("POST", {statusCode}, req.body);
  console.log("POST", { statusCode });

  const orders = await db
    .collection(`restaurants/${restaurantId}/orders`)
    .where("printed", "==", false)
    .where("status", "==", order_status.order_placed)
    .where("timeCreated", ">", moment().subtract(1, "days").toDate())
    .limit(1)
    .get();

  if (orders.docs.length > 0) {
    const jobToken = orders.docs[0].id;
    console.log("POSTJOB");
    await db.collection(`restaurants/${restaurantId}/printLog`).add({
      restaurantId,
      orderId: orders.docs[0].id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({
      jobReady: true,
      mediaTypes: ["image/png"],
      jobToken,
    });
  }

  return res.json({
    jobReady: false,
  });
};

const requestStar = async (req: any, res: any) => {
  const { token, type } = req.query;
  const { restaurantId } = req.params;
  console.log("GET", { type });

  if (token) {
    const doc = await db.doc(`restaurants/${restaurantId}/orders/` + token).get();

    const svg = getSVG(req.restaurant, doc.data());
    // const png = await convert(svg, {background: "white"});
    const png = await sharp(Buffer.from(svg))
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toBuffer();

    return res.status(200).type("image/png").send(png);
  }
  return res.status(200).json({});
};

const deleteStar = async (req: any, res: any) => {
  // const { uid, type, mac, token } = req.query;
  const { token, code, retry } = req.query;
  const { restaurantId } = req.params;
  console.log("DELETE", { token, code, retry });

  if (token) {
    await db.doc(`restaurants/${restaurantId}/orders/` + token).update({ printed: true });
  }
  return res.status(200).send();
};

const startPath = "/r/:restaurantId/starprinter/:starKey";
apiRouter.post(startPath, common, pollingStar);
apiRouter.get(startPath, common, requestStar);
apiRouter.delete(startPath, deleteStar);
