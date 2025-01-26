import * as admin from "firebase-admin";
import * as Sentry from "@sentry/node";

import exportIfNeeded from "./lib/exportifneeded";

const senty_dsn = process.env.SENTY_DSN ?? "";
Sentry.init({ dsn: senty_dsn });

if (!admin.apps.length) {
  admin.initializeApp();
}

// exportIfNeeded("api", "api", exports);
exportIfNeeded("apiJP2", "apiJP2", exports);

exportIfNeeded("superDispatch2", "super/superDispatch", exports);
exportIfNeeded("superTwilio2", "super/superTwilio", exports);

// exportIfNeeded("batchBigQueryPV", "batch/bigQueryPV", exports);

exportIfNeeded("accountDelete", "accountDelete", exports);

exportIfNeeded("lineVerifyFriend", "line/lineVerifyFriend", exports); // by user profile
exportIfNeeded("lineValidate", "line/lineValidate", exports); // callback, user and admin

exportIfNeeded("liffAuthenticate", "line/liffAuthenticate", exports); // liff jp

// exportIfNeeded("orderCreatedJp", "order/orderCreatedJp", exports); // jp
exportIfNeeded("orderCreatedJp2", "order/orderCreatedJp2", exports); // jp
exportIfNeeded("orderUpdateJp", "order/orderUpdateJp", exports);
exportIfNeeded("orderPlaceJp", "order/orderPlaceJp", exports);

exportIfNeeded("orderChangeJp", "stripe/orderChangeJp", exports);

exportIfNeeded("stripeConnect", "stripe/stripeConnect", exports);
exportIfNeeded("stripeDisconnect", "stripe/stripeDisconnect", exports);
exportIfNeeded("stripeVerify", "stripe/stripeVerify", exports);

exportIfNeeded("stripeCancelIntent", "stripe/stripeCancelIntent", exports);
exportIfNeeded("stripePaymentCancelIntent", "stripe/stripePaymentCancelIntent", exports);

exportIfNeeded("stripeUpdateCustomer", "stripe/stripeUpdateCustomer", exports);
exportIfNeeded("stripeDeleteCard", "stripe/stripeDeleteCard", exports);
// exportIfNeeded("stripepay", "stripe/stripePayIntent", exports);
exportIfNeeded("stripepay2", "stripe/stripePayIntent2", exports);

exportIfNeeded("stripeReceipt", "stripe/stripeReceipt", exports);

exportIfNeeded("imageProcessing", "image/imageProcessing", exports);

// exportIfNeeded("smaregiAuth", "smaregi/auth", exports);
// exportIfNeeded("smaregiStoreList", "smaregi/storeList", exports);
// exportIfNeeded("smaregiProductList", "smaregi/productList", exports);

exportIfNeeded("smaregiAuth2", "smaregi/auth2", exports);
exportIfNeeded("smaregiStoreList2", "smaregi/storeList2", exports);
exportIfNeeded("smaregiProductList2", "smaregi/productList2", exports);

exportIfNeeded("subAccountInvite2", "subaccount/invite", exports);
exportIfNeeded("subAccountInvitationAccept2", "subaccount/accept", exports);
exportIfNeeded("subAccountInvitationDeny2", "subaccount/deny", exports);
exportIfNeeded("subAccountDeleteChild2", "subaccount/delete", exports);



exportIfNeeded("ping2", "ping2", exports);
exportIfNeeded("beforeSignIn", "auth/beforeSignIn", exports);
