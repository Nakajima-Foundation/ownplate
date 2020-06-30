// PROJECT=123 npm run batch -- ./batch/template.js
import * as admin from "firebase-admin";
import * as constant from "../src/plugins/constant.js";

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

  const refCollection = db.collectionGroup("orders");
  const next = async (query) => {
    const doc = (await query
      .limit(1).get()).docs[0];
    if (doc) {
      // Do the real work here
      const data = doc.data();
      if (!data.timeConfirmed && data.updatedAt) {
        if (fRun) {
          await doc.ref.update({ timeConfirmed: data.updatedAt })
          console.log(doc.id, "updated");
        } else {
          console.log(doc.id);
        }
      }

      return query.startAfter(doc)
    }
    return null
  }

  let query = refCollection.where("status", "==", constant.order_status.customer_picked_up);
  do {
    query = await next(query);
  } while (query)
  process.exit(0);
};

main();
