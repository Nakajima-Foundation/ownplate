import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { log } from "firebase-functions/logger";

import { validatePing } from "../lib/validator";
import { pingData } from "../lib/types";
import * as utils from "../lib/utils";

export const operationLog = (context: CallableRequest, params: any) => {
  const uid = context.auth?.uid;
  const restaurantId = params.restaurantId || "-----";
  const operationType = params.operationType || "-----";
  const pathName = params.pathName || "";

  const header: Record<string, string> = {};
  for (let i = 0; i < context.rawRequest.rawHeaders.length; i += 2) {
    header[context.rawRequest.rawHeaders[i]] = context.rawRequest.rawHeaders[i + 1];
  }
  // console.log( JSON.stringify(header));
  const referer = header["Referer"];
  const userAgent = header["User-Agent"];
  const platform = header["Sec-Ch-Ua-Platform"];
  const city = header["X-Appengine-City"];
  const cityLL = header["X-Appengine-Citylatlong"];
  const country = header["X-Appengine-Country"];
  const ip = header["X-Appengine-User-Ip"];

  const signInIpAddress = context.auth?.token?.signInIpAddress || "";
  if (signInIpAddress && signInIpAddress !== ip) {
    log("differentIP: " + uid, { signInIpAddress, ip });
  }

  // path, restautantId, time, method, options
  const logData = {
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
    signInIpAddress,
  };
  const message = [operationType, restaurantId, uid].join(":");
  log(message, logData);
};

export const ping = async (db: admin.firestore.Firestore, data: pingData, context: CallableRequest) => {
  const { operationType, restaurantId, pathName } = data;
  utils.validate_admin_auth(context);

  const validateResult = validatePing(data);
  if (!validateResult.result) {
    console.error("ping", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  operationLog(context, {
    restaurantId: restaurantId || "index",
    operationType: operationType || "unknown",
    pathName: pathName || "",
  });
  return { result: true };
};
