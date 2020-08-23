import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import * as utils from '../lib/utils'
import { deleteCustomer } from '../stripe/customer';

export const deleteAccount = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);

  try {
    const refCollection = db
      .collectionGroup("orders")
      .where("uid", "==", uid)
      .orderBy("timePlaced", "desc");
    const next = async _query => {
      const doc = (await _query.limit(1).get()).docs[0];
      if (doc) {
        await doc.ref.update({
          accountDeleted: true,
          timeAccountDeleted: admin.firestore.FieldValue.serverTimestamp()
        });
        return refCollection.startAfter(doc);
      }
      return null;
    };
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> | null = refCollection;
    let count = -1;
    do {
      query = await next(query);
      count++;
    } while (query);

    const refUser = db.doc(`/users/${uid}`);
    const refSystem = refUser.collection("system");
    const refPrivate = refUser.collection("private");
    await refSystem.doc("line").delete();
    await refPrivate.doc("line").delete();
    await refPrivate.doc("profile").delete();
    await refUser.delete();
    await deleteCustomer(db, uid);

    return { result: uid, count }
  } catch (error) {
    throw utils.process_error(error)
  }
}
