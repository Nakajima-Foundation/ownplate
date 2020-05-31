import * as admin from "firebase-admin";

// PROJECT=123 npm run customclaims
const project = process.env.PROJECT || "ownplate-dev";

console.log(`project: ${project}`);

const main = async () => {
  const fRun = (process.argv[2] === "--doit")
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
    const refStripe = refPublic.doc("stripe");
    const stripe = (await refStripe.get()).data();
    if (stripe) {
      const refPayment = refPublic.doc("payment");
      const payment = (await refPayment.get()).data();
      if (!payment) {
        const newData = {
          stripe: stripe.stripeAccount,
          inStore: false
        };
        console.log(`set ${JSON.stringify(newData)} at ${refPayment.path}`);
      }
    }
  });
  await Promise.all(promisses);

  process.exit(0);
};

main();
