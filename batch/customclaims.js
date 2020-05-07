import * as admin from "firebase-admin";

// todo environment variables
const project = "ownplate-dev";

const main = async () => {
  const serviceAccount = await import(`./keys/${project}-firebase-adminsdk.json`);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${project}.firebaseio.com`
  });

  const db = admin.firestore();

  // todo see flag.
  const updateFlag = async (flag) => {
    const users = await db.collection("users").where("admin", "==", flag).get();

    await Promise.all(users.docs.map(async (userSnap) => {
      const user = userSnap.data();

      const uid = userSnap.id;
      // console.log(user, uid);
      const customClaims = {admin: flag};
      await admin.auth().setCustomUserClaims(uid, customClaims);
      const updated = await admin.auth().getUser(uid);
      console.log(updated);
      return;
    }));
    return
  };
  await updateFlag(true);
  await updateFlag(false);
};

main();
