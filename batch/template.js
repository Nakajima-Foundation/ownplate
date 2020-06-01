// npm run batch -- ./batch/template.js
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
  const refCollection = db.collection("users");
  const next = async (last) => {
    let query = last ? refCollection.startAfter(last) : refCollection;
    const doc = (await query.limit(1).get()).docs[0];
    if (doc) {
      console.log(doc.data());
      next(doc)
    } else {
      process.exit(0);
    }
  }
  next(null);
};

main();
