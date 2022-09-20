import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const operationLog = (context: functions.https.CallableContext, params: any) => {
  const uid = context.auth?.uid;
  const restaurantId = params.restaurantId || "-----";
  const operationType = params.operationType || "-----";
  const pathName = params.pathName || "";
  
  const header = {};
  for(let i = 0; i < context.rawRequest.rawHeaders.length; i +=2) {
    header[context.rawRequest.rawHeaders[i]] = context.rawRequest.rawHeaders[i + 1];
  }
  // console.log( JSON.stringify(header));
  const referer = header['Referer'];
  const userAgent = header['User-Agent'];
  const platform = header['Sec-Ch-Ua-Platform'];
  const city = header['X-Appengine-City'];
  const cityLL = header['X-Appengine-Citylatlong'];
  const country = header['X-Appengine-Country'];
  const ip = header['X-Appengine-User-Ip'];

  // path, restautantId, time, method, options
  const log = {
    logType: "operationLog",
    operationType,
    referer,
    userAgent,
    platform,
    city,
    cityLL,
    country,
    ip,
    restaurantId,
    uid,
    pathName,
  };
  const message = [
    operationType, restaurantId, uid, 
  ].join(":");
  functions.logger.log(message, log);
  
};

// eslint-disable-next-line
export const ping = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { operationType, restaurantId, pathName } = data;
  
  operationLog(context, {
    restaurantId: restaurantId || "index",
    operationType: operationType || "unknown",
    pathName: pathName || "",
  });
  return { result: true };
  
};
