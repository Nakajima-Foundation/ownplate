import * as admin from "firebase-admin";
import * as Sentry from "@sentry/node";

import exportIfNeeded from "./lib/exportifneeded";

const senty_dsn = process.env.SENTY_DSN ?? "";
Sentry.init({ dsn: senty_dsn });

if (!admin.apps.length) {
  admin.initializeApp();
}

exportIfNeeded("apiJP2", "apiJP", exports);

exportIfNeeded("superDispatch2", "super/superDispatch", exports);
exportIfNeeded("superTwilio2", "super/superTwilio", exports);
exportIfNeeded("stripeVerify2", "super/stripeVerify", exports);

// exportIfNeeded("batchBigQueryPV", "batch/bigQueryPV", exports);

exportIfNeeded("accountDelete2", "accountDelete", exports);

exportIfNeeded("lineVerifyFriend2", "line/lineVerifyFriend", exports); // by user profile
exportIfNeeded("lineValidate2", "line/lineValidate", exports); // callback, user and admin

exportIfNeeded("liffAuthenticate2", "line/liffAuthenticate", exports); // liff jp

exportIfNeeded("orderCreatedJp2", "order/orderCreatedJp", exports); // jp
exportIfNeeded("orderUpdateJp2", "order/orderUpdateJp", exports);
exportIfNeeded("orderPlaceJp2", "order/orderPlaceJp", exports);

exportIfNeeded("orderChangeJp2", "stripe/orderChangeJp", exports);

exportIfNeeded("stripeConnect2", "stripe/stripeConnect", exports);
exportIfNeeded("stripeDisconnect2", "stripe/stripeDisconnect", exports);

exportIfNeeded("stripeCancelIntent2", "stripe/stripeCancelIntent", exports);
exportIfNeeded("stripePaymentCancelIntent2", "stripe/stripePaymentCancelIntent", exports);

exportIfNeeded("stripeDeleteCard2", "stripe/stripeDeleteCard", exports);
exportIfNeeded("stripepay2", "stripe/stripePayIntent", exports);

exportIfNeeded("stripeReceipt2", "stripe/stripeReceipt", exports);

exportIfNeeded("imageProcessing2", "image/imageProcessing", exports);

exportIfNeeded("smaregiAuth2", "smaregi/auth", exports);
exportIfNeeded("smaregiStoreList2", "smaregi/storeList", exports);
exportIfNeeded("smaregiProductList2", "smaregi/productList", exports);

exportIfNeeded("subAccountInvite2", "subaccount/invite", exports);
exportIfNeeded("subAccountInvitationAccept2", "subaccount/accept", exports);
exportIfNeeded("subAccountInvitationDeny2", "subaccount/deny", exports);
exportIfNeeded("subAccountDeleteChild2", "subaccount/delete", exports);



exportIfNeeded("ping2", "ping", exports);
exportIfNeeded("beforeSignIn2", "auth/beforeSignIn", exports);
