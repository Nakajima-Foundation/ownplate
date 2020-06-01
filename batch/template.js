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
  const next = async (i) => {
    setTimeout(() => {
      console.log(i);
      if (i < 10) {
        next(i + 1);
      } else {
        process.exit(0);
      }
    }, 500);
  }
  next(0);
};

main();
