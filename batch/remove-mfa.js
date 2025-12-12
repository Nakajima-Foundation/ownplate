// Remove MFA enrollment for a user
// Usage: PROJECT=ownplate-jp npm run batch -- ./batch/remove-mfa.js W0jwRp9e2LDSDDR8BEVs [--doit]
import * as admin from "firebase-admin";

const project = process.env.PROJECT || "ownplate-dev";
console.log(`project: ${project}`);

const main = async () => {
  const restaurantId = process.argv[2];
  const fRun = process.argv[3] === "--doit";

  if (!restaurantId || restaurantId.startsWith("--")) {
    console.error("Error: Restaurant ID is required");
    console.log("Usage: PROJECT=ownplate-jp npm run batch -- ./batch/remove-mfa.js <restaurantId> [--doit]");
    process.exit(1);
  }

  console.log(fRun ? "Doing it" : "Dry run (add '--doit' option to really do it)");
  console.log(`Restaurant ID: ${restaurantId}`);

  const serviceAccount = await import(`./keys/${project}-firebase-adminsdk.json`);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${project}.firebaseio.com`
  });
  const db = admin.firestore();

  // Get restaurant document to find owner UID
  const restaurantDoc = await db.doc(`/restaurants/${restaurantId}`).get();

  if (!restaurantDoc.exists) {
    console.error(`Error: Restaurant ${restaurantId} not found`);
    process.exit(1);
  }

  const restaurantData = restaurantDoc.data();
  const ownerUid = restaurantData.uid;

  if (!ownerUid) {
    console.error("Error: Restaurant has no owner UID");
    process.exit(1);
  }

  console.log(`Owner UID: ${ownerUid}`);

  // Get user information
  const user = await admin.auth().getUser(ownerUid);
  console.log(`User email: ${user.email}`);
  console.log(`User displayName: ${user.displayName}`);

  // Check MFA enrollment
  const enrolledFactors = user.multiFactor?.enrolledFactors || [];
  console.log(`Current MFA enrollments: ${enrolledFactors.length}`);

  if (enrolledFactors.length === 0) {
    console.log("User has no MFA enrollments. Nothing to remove.");
    process.exit(0);
  }

  enrolledFactors.forEach((factor, index) => {
    console.log(`  [${index}] UID: ${factor.uid}, Type: ${factor.factorId}, Enrolled: ${factor.enrollmentTime}`);
  });

  if (fRun) {
    console.log("\nRemoving all MFA enrollments...");

    // Remove all enrolled factors
    for (const factor of enrolledFactors) {
      await admin.auth().deleteMultiFactorInfo(ownerUid, factor.uid);
      console.log(`  Removed factor: ${factor.uid}`);
    }

    console.log("✓ MFA enrollments removed successfully");

    // Verify removal
    const updatedUser = await admin.auth().getUser(ownerUid);
    const remainingFactors = updatedUser.multiFactor?.enrolledFactors || [];
    console.log(`Remaining MFA enrollments: ${remainingFactors.length}`);
  } else {
    console.log("\nDry run - no changes made. Use --doit to actually remove MFA.");
  }

  process.exit(0);
};

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});