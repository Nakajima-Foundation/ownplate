import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import * as Sentry from "@sentry/node";

import exportIfNeeded from "./lib/exportifneeded";

const senty_dsn = (functions.config() && functions.config().senty && functions.config().senty.dsn) || process.env.SENTY_DSN;
Sentry.init({ dsn: senty_dsn });

if (!admin.apps.length) {
  admin.initializeApp();
}

exportIfNeeded("api", "api", exports);

exportIfNeeded("superDispatch", "superDispatch", exports);
exportIfNeeded("superTwilio", "superTwilio", exports);

exportIfNeeded("accountDelete", "accountDelete", exports);

exportIfNeeded("lineVerifyFriend", "line/lineVerifyFriend", exports);
exportIfNeeded("lineValidate", "lineValidate", exports);
exportIfNeeded("lineAuthenticate", "lineAuthenticate", exports);
exportIfNeeded("lineSetCustomClaim", "line/lineSetCustomClaim", exports);
exportIfNeeded("liffAuthenticate", "liffAuthenticate", exports); // jp
exportIfNeeded("traceProcess", "traceProcess", exports);

exportIfNeeded("wasOrderCreatedJp", "order/orderCreatedJp", exports); // jp
exportIfNeeded("orderCreatedJp", "order/orderCreatedJp", exports); // jp
exportIfNeeded("orderUpdateJp", "order/orderUpdateJp", exports);
exportIfNeeded("orderPlaceJp", "order/orderPlaceJp", exports);

exportIfNeeded("orderChangeJp", "stripe/orderChangeJp", exports);

exportIfNeeded("stripeConnect", "stripe/stripeConnect", exports);
exportIfNeeded("stripeDisconnect", "stripe/stripeDisconnect", exports);
exportIfNeeded("stripeVerify", "stripe/stripeVerify", exports);

exportIfNeeded("stripeCreateIntent", "stripe/stripeCreateIntent", exports);
exportIfNeeded("stripeConfirmIntent", "stripe/stripeConfirmIntent", exports);
exportIfNeeded("stripeCancelIntent", "stripe/stripeCancelIntent", exports);

exportIfNeeded("stripePaymentCancelIntent", "stripe/stripePaymentCancelIntent", exports);

exportIfNeeded("stripeUpdateCustomer", "stripe/stripeUpdateCustomer", exports);
exportIfNeeded("stripeDeleteCard", "stripe/stripeDeleteCard", exports);

exportIfNeeded("stripeReceipt", "stripe/stripeReceipt", exports);

exportIfNeeded("imageProcessing", "image/imageProcessing", exports);

exportIfNeeded("smaregiAuth", "smaregi/auth", exports);
exportIfNeeded("smaregiStoreList", "smaregi/storeList", exports);
exportIfNeeded("smaregiProductList", "smaregi/productList", exports);
exportIfNeeded("subAccountInvite", "subaccount/invite", exports);
exportIfNeeded("subAccountInvitationAccept", "subaccount/accept", exports);
exportIfNeeded("subAccountInvitationDeny", "subaccount/deny", exports);
exportIfNeeded("subAccountDeleteChild", "subaccount/delete", exports);

exportIfNeeded("ping", "ping", exports);
