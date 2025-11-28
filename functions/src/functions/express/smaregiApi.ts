import express from "express";
import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";
import SmaregiApi from "../../smaregi/smaregiapi";
import { smaregi } from "../../common/project";
import { response200 } from "./apis";
import moment from "moment";

const clientSecret = defineSecret("SMAREGI_SECRET");
const apiHost = smaregi.host_name;
const authHost = smaregi.auth_host_name;

export const smaregiRouter = express.Router();

if (!admin.apps.length) {
  admin.initializeApp();
}

let db = admin.firestore();

export const updateDb = (_db: admin.firestore.Firestore) => {
  db = _db;
};

const subscribe = async (req: express.Request, res: express.Response) => {
  await db.collection("smaregiLog/log/subscribe").add({ data: req.body, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return response200(res, {});
};

export const processAction = async (data: { contractId: string; action: string; event: string; ids: Array<{ storeId: string; productId: string }> }) => {
  console.log("processAction");
  const contractId = data.contractId;
  if (data.action === "edited" && data.event === "pos:stock") {
    // get data
    const config = {
      contractId: contractId,
      clientId: smaregi.clientId,
      clientSecret: clientSecret.value(),
      hostName: apiHost,
      authHostName: authHost,
      scopes: ["pos.stock:read", "pos.stock:write", "pos.stores:read", "pos.stores:write", "pos.customers:read", "pos.customers:write", "pos.products:read", "pos.products:write"],
    };

    data.ids.map(async (idData: { storeId: string; productId: string }) => {
      const { storeId, productId } = idData;
      console.log({ storeId, productId });

      const storePath = `/smaregi/${contractId}/stores/${storeId}`;
      const storeData = (await db.doc(storePath).get()).data() || {};
      const outOfStock = storeData.outOfStock || null;
      const inStock = storeData.inStock || null;
      console.log({ inStock, outOfStock });

      const api = new SmaregiApi(config);
      await api.auth();
      const stockApi = api.stock();
      const stockListData = await stockApi.list({
        store_id: storeId,
        product_id: productId,
      });
      if (stockListData && stockListData[0]) {
        const amount = stockListData[0].stockAmount;
        console.log(amount);
        db.doc(`smaregiData/${contractId}/stores/${storeId}/smaregiProducts/${productId}`).set({
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          storeId: storeId,
          productId: productId,
          amount: Number(amount),
        });
        // if (Number(amount) < 3) {

        const smaregiPath = `/smaregi/${contractId}/stores/${storeId}/products/${productId}`;
        const smaregiData = (await db.doc(smaregiPath).get()).data();
        if (smaregiData) {
          // console.log(smaregiData);
          const { restaurantId, menuId } = smaregiData;
          const stockPath = `/restaurants/${restaurantId}/menus/${menuId}/smaregiStock/data`;
          db.doc(stockPath).set({
            restaurantId,
            menuId,
            storeId: storeId,
            productId: productId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            amount: Number(amount),
          });
          const menuPath = `/restaurants/${restaurantId}/menus/${menuId}`;
          if (outOfStock !== null && Number(amount) <= outOfStock) {
            db.doc(menuPath).update({
              soldOut: true,
              smaregiStock: Number(amount),
            });
          } else if (inStock !== null && Number(amount) >= outOfStock) {
            db.doc(menuPath).update({
              soldOut: false,
              smaregiStock: Number(amount),
            });
          } else {
            db.doc(menuPath).update({ smaregiStock: Number(amount) });
          }
        }
      }
    });
  }
};

const webhook = async (req: express.Request, res: express.Response) => {
  const data = req.body;

  const contractId = req.body.contractId;
  const time = moment().format("YYYYMMDDHHmmss.SSS");

  // tslint:disable-next-line
  processAction(data);

  await db.doc(`smaregiLog/${contractId}/month/${moment().format("YYYYMM")}/webhookLog/${time}`).set({
    data,
    contractId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return response200(res, {});
};

smaregiRouter.post("/subscribe", subscribe);
smaregiRouter.post("/webhook", webhook);
