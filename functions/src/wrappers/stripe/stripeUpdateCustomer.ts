import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as StripeCustomer from "../..//stripe/customer";

const db = admin.firestore();

export default functions
  .runWith({
    memory: "1GB" as "1GB",
  })    
  .https.onCall(async (data, context) => {
  return await StripeCustomer.update(db, data, context);
});
