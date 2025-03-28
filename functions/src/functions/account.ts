import { CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { validate_customer_auth, process_error } from "../lib/utils";
import { deleteCustomer } from "./stripe/customer";

export const deleteAccount = async (db: admin.firestore.Firestore, context: CallableRequest) => {
  const customerUid = validate_customer_auth(context);

  try {
    const refCollection = db.collectionGroup("orders").where("uid", "==", customerUid).orderBy("timePlaced", "desc");
    const next = async (_query) => {
      const docs = (await _query.limit(100).get()).docs;
      if (docs.length > 0) {
        const batch = db.batch();
        docs.map((doc) => {
          batch.update(doc.ref, {
            accountDeleted: true,
            timeAccountDeleted: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
        if (docs.length === 100) {
          return refCollection.startAfter(docs[100 - 1]);
        }
        return null;
      }
      return null;
    };

    let query: admin.firestore.Query<admin.firestore.DocumentData> | null = refCollection;
    let count = -1;
    do {
      query = await next(query);
      count++;
      console.log("delete");
    } while (query);

    const refUser = db.doc(`/users/${customerUid}`);
    const refSystem = refUser.collection("system");
    const refPrivate = refUser.collection("private");
    await refSystem.doc("line").delete();
    await refPrivate.doc("line").delete();
    await refPrivate.doc("profile").delete();
    await refUser.delete();
    await deleteCustomer(db, customerUid);

    return { result: customerUid, count };
  } catch (error) {
    throw process_error(error);
  }
};
