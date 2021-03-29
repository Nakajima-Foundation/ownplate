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
  const limit = 30;
  let adminCollection = db.collection("admins").orderBy("created").limit(limit);

  const emails = [];
  let docs = [];
  do {
    docs = (await adminCollection.get()).docs;
    
    await Promise.all(docs.map(async doc => {
      const db_user = doc.data();
      const uid = doc.id;
      const user = await admin.auth().getUser(uid);
      if (user) {
        // opt_out
        const adminConfigDoc = await db.doc(`/adminConfigs/${uid}`).get();
        const adminConfig  = (adminConfigDoc.exists) ? adminConfigDoc.data() : {};
        const opt_out = adminConfig.opt_out || false;
        if (!opt_out) {
          emails.push(user.email);
        }
      }
      return true;
    }));
    console.log(docs.length );
    if (docs.length === limit) {
      const last = docs[limit - 1];
      adminCollection = db.collection("admins").orderBy("created").startAfter(last).limit(limit);
    }
  } while(docs.length === limit);
  
  const split = (array, n) => array.reduce((a, c, i) => i % n == 0 ? [...a, [c]] : [...a.slice(0, -1), [...a[a.length - 1], c]], [])

  const sRes = split(emails, 50);

  sRes.forEach((a) => {
    console.log(a.join(","));
    console.log("\n");
  });
  // console.log("Note: This migration code is safe to run more than once")

  process.exit(0);
};

main();
