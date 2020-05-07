import * as admin from "firebase-admin";

const project = "ownplate-dev";

const main = async () => {
  const serviceAccount = await import(`./keys/${project}-firebase-adminsdk.json`);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${project}.firebaseio.com`
  });

  const db = admin.firestore();

  const users = await db.collection("users").get();

  await Promise.all(users.docs.map(async (userSnap) => {
    const user = userSnap.data();

    if (user.name === "Satoshi") {
      const uid = userSnap.id;
      // console.log(user, uid);
      const customClaims = {admin: true};
      await admin.auth().setCustomUserClaims(uid, customClaims);
      const updated = await admin.auth().getUser(uid);
      console.log(updated);
      return;
    }
  }));
  return;
};

main();
