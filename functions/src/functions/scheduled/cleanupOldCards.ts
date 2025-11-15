import * as admin from "firebase-admin";
import * as utils from "../../lib/utils";

/**
 * Cleanup old card information that hasn't been updated in 180 days
 * This runs daily to remove expired card data from Firestore and Stripe
 */
export const cleanupOldCards = async (db: admin.firestore.Firestore) => {
  const stripe = utils.get_stripe_v2();
  const now = admin.firestore.Timestamp.now();
  const expirationDays = 180;
  const expirationMs = expirationDays * 24 * 60 * 60 * 1000;
  const cutoffTime = new admin.firestore.Timestamp(
    now.seconds - expirationMs / 1000,
    now.nanoseconds
  );

  console.log(`Starting cleanup of cards older than ${expirationDays} days (before ${cutoffTime.toDate().toISOString()})`);

  let totalDeleted = 0;
  let totalErrors = 0;

  try {
    // Use collectionGroup to query all documents under 'readonly' subcollection
    // This will match both:
    // - users/{userId}/readonly/stripe (global cards)
    // - users/{userId}/owner/{ownerId}/readonly/stripe (restaurant-specific cards)
    const readonlyStripeQuery = db
      .collectionGroup("readonly")
      .where("updatedAt", "<", cutoffTime);

    const snapshot = await readonlyStripeQuery.get();

    console.log(`Found ${snapshot.size} old card documents to process`);

    for (const doc of snapshot.docs) {
      try {
        // Parse path to determine if it's global or restaurant-specific
        // Global: users/{userId}/readonly/stripe (4 parts)
        // Restaurant: users/{userId}/owner/{ownerId}/readonly/stripe (6 parts)
        const pathParts = doc.ref.path.split("/");

        let userId: string;
        let ownerId: string | null = null;
        let systemPath: string;

        if (pathParts.length === 4 && pathParts[2] === "readonly" && pathParts[3] === "stripe") {
          // Global card: users/{userId}/readonly/stripe
          userId = pathParts[1];
          systemPath = `users/${userId}/system/stripe`;
        } else if (pathParts.length === 6 && pathParts[4] === "readonly" && pathParts[5] === "stripe") {
          // Restaurant-specific card: users/{userId}/owner/{ownerId}/readonly/stripe
          userId = pathParts[1];
          ownerId = pathParts[3];
          systemPath = `users/${userId}/owner/${ownerId}/system/stripe`;
        } else {
          console.warn(`Unexpected path format: ${doc.ref.path}`);
          continue;
        }

        const data = doc.data();
        const updatedAt = data.updatedAt as admin.firestore.Timestamp | undefined;

        const cardType = ownerId ? `restaurant (owner: ${ownerId})` : "global";
        console.log(`Deleting old ${cardType} card for user ${userId} (updated: ${updatedAt?.toDate().toISOString()})`);

        // Get system/stripe to access payment_method
        const systemStripeRef = db.doc(systemPath);
        const systemStripeDoc = await systemStripeRef.get();

        // Try to detach from Stripe first
        if (systemStripeDoc.exists) {
          const systemData = systemStripeDoc.data();
          if (systemData?.payment_method) {
            try {
              // Get stripe account
              // For restaurant-specific cards, use owner's account
              // For global cards, payment_method should be detached from default account
              let stripeAccount: string | undefined;

              if (ownerId) {
                const adminDoc = await db.doc(`/admins/${ownerId}`).get();
                if (adminDoc.exists) {
                  const adminData = adminDoc.data();
                  stripeAccount = adminData?.stripeAccount;
                }
              }

              if (stripeAccount || !ownerId) {
                await stripe.paymentMethods.detach(
                  systemData.payment_method,
                  {},
                  stripeAccount ? { stripeAccount } : {}
                );
                console.log(`  Detached payment method ${systemData.payment_method} from Stripe`);
              }
            } catch (stripeError) {
              // Log error but continue with Firestore deletion
              console.error("  Failed to detach payment method from Stripe:" stripeError);
              totalErrors++;
            }
          }

          // Delete system/stripe
          await systemStripeRef.delete();
        }

        // Delete readonly/stripe (the document we queried)
        await doc.ref.delete();

        totalDeleted++;
        console.log(`  Deleted ${cardType} card data for user ${userId}`);
      } catch (docError) {
        console.error(`Error processing document ${doc.ref.path}:`, docError);
        totalErrors++;
      }
    }

    console.log(`Cleanup completed. Deleted: ${totalDeleted}, Errors: ${totalErrors}`);
    return { success: true, deleted: totalDeleted, errors: totalErrors };
  } catch (error) {
    console.error("Cleanup failed:", error);
    throw error;
  }
};
