import express from "express";
import { getApps, initializeApp } from "firebase-admin/app";
import { DocumentData, FieldValue, Firestore, getFirestore } from "firebase-admin/firestore";
// import { ownPlateConfig } from "../../common/project";
// import cors from "cors";
// import * as Sentry from "@sentry/node";

import { RestaurantInfoData } from "../../models/RestaurantInfo";
import { RequestWithRestaurant } from "../../lib/types/restaurant";

import { validateFirebaseId } from "../../lib/validator";
import { order_status } from "../../common/constant";
import { buildReceiptText } from "./receiptFormat";
import moment from "moment-timezone";
import * as receiptline from "receiptline";
// import { convert } from 'convert-svg-to-png';
import sharp from "sharp";

export const apiRouter = express.Router();

if (!getApps().some((app) => app.name === "[DEFAULT]")) {
  initializeApp();
}

let db = getFirestore();

export const updateDb = (_db: Firestore) => {
  db = _db;
};

export const response200 = (res: express.Response, payload: unknown) => {
  return res.json({
    result: true,
    payload,
  });
};

export const getSVG = (restaurantData: DocumentData, orderData: DocumentData) => {
  return receiptline.transform(buildReceiptText(restaurantData, orderData), { encoding: "cp932" });
};

// Express 5 の params は wildcard ルート用に string[] も取りうる。ここは名前付き
// パラメータだけのルートなので、実際に受け取る形を型で明示する。
type StarPrinterParams = { restaurantId: string; starKey: string };

const common = async (req: express.Request<StarPrinterParams>, res: express.Response, next: express.NextFunction): Promise<void> => {
  const { restaurantId, starKey } = req.params;

  if (!validateFirebaseId(restaurantId)) {
    res.status(404).send("");
    return;
  }

  const restaurant = await db.doc(`restaurants/${restaurantId}`).get();
  if (!restaurant || !restaurant.exists) {
    res.status(404).send("");
    return;
  }
  const restaurant_data = restaurant.data();
  if (!restaurant_data || !restaurant_data.publicFlag || restaurant_data.deletedFlag) {
    res.status(404).send("");
    return;
  }

  const restaurantPrinter = await db.doc(`restaurants/${restaurantId}/private/printer`).get();
  if (!restaurantPrinter || !restaurantPrinter.exists) {
    res.status(400).send("");
    return;
  }
  const restaurantPrinterData = restaurantPrinter.data();
  if (!restaurantPrinterData || restaurantPrinterData.key !== starKey) {
    res.status(400).send("");
    return;
  }

  // todo auth
  (req as RequestWithRestaurant).restaurant = restaurant_data as RestaurantInfoData;
  next();
};

const pollingStar = async (req: express.Request, res: express.Response) => {
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
      createdAt: FieldValue.serverTimestamp(),
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

const requestStar = async (req: express.Request, res: express.Response) => {
  const { token, type } = req.query;
  const { restaurantId } = req.params;
  console.log("GET", { type });

  if (token) {
    const doc = await db.doc(`restaurants/${restaurantId}/orders/` + token).get();
    const restaurant = (req as RequestWithRestaurant).restaurant;
    if (!restaurant) {
      return res.status(400).json({ error: "Restaurant not found" });
    }

    const svg = getSVG(restaurant, doc.data()!);
    // const png = await convert(svg, {background: "white"});
    const png = await sharp(Buffer.from(svg))
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toBuffer();

    return res.status(200).type("image/png").send(png);
  }
  return res.status(200).json({});
};

const deleteStar = async (req: express.Request, res: express.Response) => {
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
