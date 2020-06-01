// npm run batch -- ./batch/template.js
import * as admin from "firebase-admin";

// PROJECT=123 npm run customclaims
const project = process.env.PROJECT || "ownplate-dev";

console.log(`project: ${project}`);
const fRun = (process.argv[2] === "--doit")
console.log(fRun ? "Doing it" : "Dry run (add '--doit' option to really do it)")

const main = async () => {
  const serviceAccount = await import(`./keys/${project}-firebase-adminsdk.json`);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${project}.firebaseio.com`
  });

  const db = admin.firestore();
  const refCollection = db.collection("users");
  const next = async (query) => {
    const doc = (await query.limit(1).get()).docs[0];
    if (doc) {
      // Do the real work here
      console.log(doc.data());

      next(refCollection.startAfter(doc))
    } else {
      process.exit(0);
    }
  }
  next(refCollection);
};

main();
