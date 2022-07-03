import * as admin from "firebase-admin";

// PROJECT=123 npm run customclaims
const project = process.env.PROJECT || "ownplate-dev";

console.log(`project: ${project}`);

const main = async () => {
  const serviceAccount = await import(`./keys/${project}-firebase-adminsdk.json`);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${project}.firebaseio.com`
  });

  const db = admin.firestore();

  const isDebug = true;
  const updateFlag = async (flag, key) => {
    const users = await db.collection("admins").where(key, "==", flag).get();

    await Promise.all(users.docs.map(async (userSnap) => {
      const user = userSnap.data();

      const uid = userSnap.id;
      console.log(user.name, uid);
      const customClaims = {[key]: flag};
      console.log(customClaims);
      
      if (!isDebug) {
        await admin.auth().setCustomUserClaims(uid, customClaims);
        const updated = await admin.auth().getUser(uid);
        console.log(updated);
      }
      return;
    }));
    return;
  };
  await updateFlag(true, "admin");
  await updateFlag(false, "admin");

  await updateFlag(true, "operator");
  await updateFlag(false, "operator");

  process.exit(0);
};

main();
