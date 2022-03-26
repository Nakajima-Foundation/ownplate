import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import fetch from "node-fetch";
import SmaregiApi from "../smaregi/smaregiapi";
import * as utils from "../lib/utils";
import { generateBody } from "../smaregi/apiUtils";

const clientSecrets = functions.config() && functions.config().smaregi && functions.config().smaregi.clientsecrets;
const host = functions.config() && functions.config().smaregi && functions.config().smaregi.host; // https://id.smaregi.dev
const apiHost = functions.config() && functions.config().smaregi && functions.config().smaregi.host_name; // like api.smaregi.dev
const authHost = functions.config() && functions.config().smaregi && functions.config().smaregi.auth_host_name;  // id.smaregi.dev

console.log(apiHost, authHost);
export const auth = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { code, client_id } = data;

  const adminUid = utils.validate_auth(context);
  const clientSecret = clientSecrets[client_id];
  const authToken = [client_id, clientSecret].join(":");

  try {
    const res = await fetch(host + "/authorize/token", {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(authToken).toString("base64"),
      },
      body: generateBody({
        grant_type: "authorization_code",
        code: code,
      }),
    });
    if (res.status !== 200) {
      return { result: false };
    }
    const authRet = await res.json();

    const userRes = await fetch(host + "/userinfo", {
      method: "post",
      headers: {
        Authorization: "Bearer " + authRet.access_token,
      },
    });
    if (userRes.status !== 200) {
      return { result: false };
    }

    const ret = await userRes.json();
    if (ret.is_owner!) {
      throw new functions.https.HttpsError("invalid-argument", "You are not owner.");
    }
    const contractId = ret.contract.id;
    const smaregiRef = db.doc(`/smaregi/${contractId}`);
    const smaregiDoc = await smaregiRef.get();
    const smaregiData = smaregiDoc.data();
    if (smaregiDoc && smaregiData && smaregiData.uid !== adminUid) {
      throw new functions.https.HttpsError("invalid-argument", "This smaregi account already connected.");
    }
    await smaregiRef.set({ contractId, uid: adminUid });
    await db.doc(`admins/${adminUid}/private/smaregi`).set({ smaregi: ret }, { merge: true });
    await db.doc(`admins/${adminUid}/public/smaregi`).set({ smaregi: true }, { merge: true });

    return { result: true };
  } catch (e) {
    console.log(e);
    return { result: false };
  }
};

export const storeList = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { client_id } = data;

  const adminUid = utils.validate_auth(context);
  const clientSecret = clientSecrets[client_id];

  const smaregiDoc = await db.doc(`admins/${adminUid}/private/smaregi`).get();
  if (!smaregiDoc || !smaregiDoc.exists) {
    throw new functions.https.HttpsError("invalid-argument", "This data does not exist.");
  }
  const smaregiData = smaregiDoc.data();
  const smaregiContractId = smaregiData?.smaregi?.contract?.id;
  if (!smaregiContractId) {
    throw new functions.https.HttpsError("invalid-argument", "This data does not exist.");
  }

  const config = {
    contractId: smaregiContractId,
    clientId: client_id,
    clientSecret: clientSecret,
    hostName: apiHost,
    authHostName: authHost,
    scopes: ["pos.stock:read", "pos.stock:write", "pos.stores:read", "pos.stores:write", "pos.customers:read", "pos.customers:write", "pos.products:read", "pos.products:write"],
  };

  const api = new SmaregiApi(config);
  await api.auth();
  const storesApi = api.stores();
  const storeListData = await storesApi.list();

  return { res: storeListData };
};

export const productList = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { client_id, store_id } = data;

  const adminUid = utils.validate_auth(context);
  const clientSecret = clientSecrets[client_id];

  const smaregiDoc = await db.doc(`admins/${adminUid}/private/smaregi`).get();
  if (!smaregiDoc || !smaregiDoc.exists) {
    throw new functions.https.HttpsError("invalid-argument", "This data does not exist.");
  }
  const smaregiData = smaregiDoc.data();
  const smaregiContractId = smaregiData?.smaregi?.contract?.id;
  if (!smaregiContractId) {
    throw new functions.https.HttpsError("invalid-argument", "This data does not exist.");
  }

  const config = {
    contractId: smaregiContractId,
    clientId: client_id,
    clientSecret: clientSecret,
    hostName: apiHost,
    authHostName: authHost,
    scopes: ["pos.stock:read", "pos.stock:write", "pos.stores:read", "pos.stores:write", "pos.customers:read", "pos.customers:write", "pos.products:read", "pos.products:write"],
  };

  const api = new SmaregiApi(config);
  await api.auth();
  const storesApi = api.stores();
  const productListData = await storesApi.id(store_id).storeProducts().list();

  return { res: productListData };
};
