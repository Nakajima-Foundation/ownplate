import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
// import * as functions from "firebase-functions/v1";
import { defineSecret } from "firebase-functions/params";
import fetch from "node-fetch";
import SmaregiApi from "../smaregi/smaregiapi";
import { validate_admin_auth } from "../lib/utils";
import { generateBody } from "../smaregi/apiUtils";

import { SmaregiAuthData, SmaregiStoreListData, SmaregiProductListData } from "../models/functionTypes";
import { smaregi } from "../common/project";
import { validateFirebaseId } from "../lib/validator";

const clientSecret = defineSecret("SMAREGI_SECRET");
const host = smaregi.host;
const apiHost = smaregi.host_name;
const authHost = smaregi.auth_host_name;
const client_id = smaregi.clientId;

export const auth = async (db: admin.firestore.Firestore, data: SmaregiAuthData, context: CallableRequest) => {
  const { code } = data;

  const adminUid = validate_admin_auth(context);
  const authToken = [client_id, clientSecret.value()].join(":");

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
      throw new HttpsError("invalid-argument", "You are not owner.");
    }
    const contractId = ret.contract.id;
    const smaregiRef = db.doc(`/smaregi/${contractId}`);
    const smaregiDoc = await smaregiRef.get();
    const smaregiData = smaregiDoc.data();
    if (smaregiDoc && smaregiData && smaregiData.uid !== adminUid) {
      throw new HttpsError("invalid-argument", "This smaregi account already connected.");
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

export const storeList = async (db: admin.firestore.Firestore, data: SmaregiStoreListData, context: CallableRequest) => {
  const adminUid = validate_admin_auth(context);

  const smaregiDoc = await db.doc(`admins/${adminUid}/private/smaregi`).get();
  if (!smaregiDoc || !smaregiDoc.exists) {
    throw new HttpsError("invalid-argument", "This data does not exist.");
  }
  const smaregiData = smaregiDoc.data();
  const smaregiContractId = smaregiData?.smaregi?.contract?.id;
  if (!smaregiContractId) {
    throw new HttpsError("invalid-argument", "This data does not exist.");
  }

  const config = {
    contractId: smaregiContractId,
    clientId: client_id,
    clientSecret: clientSecret.value(),
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

export const productList = async (db: admin.firestore.Firestore, data: SmaregiProductListData, context: CallableRequest) => {
  const { store_id } = data;
  if (!validateFirebaseId(store_id)) {
    throw new HttpsError("invalid-argument", "invalid args.");
  }

  const adminUid = validate_admin_auth(context);

  const smaregiDoc = await db.doc(`admins/${adminUid}/private/smaregi`).get();
  if (!smaregiDoc || !smaregiDoc.exists) {
    throw new HttpsError("invalid-argument", "This data does not exist.");
  }
  const smaregiData = smaregiDoc.data();
  const smaregiContractId = smaregiData?.smaregi?.contract?.id;
  if (!smaregiContractId) {
    throw new HttpsError("invalid-argument", "This data does not exist.");
  }

  const config = {
    contractId: smaregiContractId,
    clientId: client_id,
    clientSecret: clientSecret.value(),
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
