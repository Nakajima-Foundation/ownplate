// npm run batch -- ./batch/migrate_payment.js

import * as admin from "firebase-admin";

// PROJECT=123 npm run customclaims
const project = process.env.PROJECT || "ownplate-dev";

console.log(`project: ${project}`);

const main = async () => {
  const fRun = (process.argv[2] === "--doit")
  console.log(fRun ? "Doing it" : "Dry run (add '--doit' option to really do it)")
  const serviceAccount = await import(`./keys/${project}-firebase-adminsdk.json`);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${project}.firebaseio.com`
  });

  const db = admin.firestore();
  const docs = (await db.collection("admins").get()).docs;
  const promisses = docs.map(async doc => {
    const admin = doc.data();
    const refPublic = doc.ref.collection("public");
    const refStripe = refPublic.doc("stripe"); // reference to old data
    const refPayment = refPublic.doc("payment"); // reference to new data
    await db.runTransaction(async tx => {
      const stripe = (await tx.get(refStripe)).data(); // old data
      if (stripe) {
        const payment = (await tx.get(refPayment)).data(); // new data
        if (!payment) { // no need to migrate twice
          const newData = {
            stripe: stripe.stripeAccount,
            inStore: false
          };
          console.log(`set ${JSON.stringify(newData)} at ${refPayment.path}`);
          if (fRun) {
            tx.set(refPayment, newData);
          }
        }
        // Note: We are NOT deleting old data
      }
    })
  });
  await Promise.all(promisses);
  console.log("Note: This migration code is safe to run more than once")

  process.exit(0);
};

main();
