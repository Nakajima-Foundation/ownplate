import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import * as utils from '../lib/utils'

import isEmail from "validator/lib/isEmail";

import { Context } from '../models/TestType'

export const invite = async (db, data: any, context: functions.https.CallableContext | Context) => {

  // check admin
  const adminUid = utils.validate_parent_admin_auth(context);
  const { email, name } = data;

  // get user
  try {
    if (!isEmail(email)) {
      throw new functions.https.HttpsError('invalid-argument', 'invalid email.')
    }

    const user = await admin.auth().getUserByEmail(email)
    if (!user) {
      throw new functions.https.HttpsError('invalid-argument', 'User does not exist.')
    }
    if (user.customClaims?.parentUid) {
      throw new functions.https.HttpsError('invalid-argument', 'User is child.')
    }
    const childUid = user.uid;

    if (childUid === adminUid) {
      throw new functions.https.HttpsError('invalid-argument', 'U called your self.')
    }

    // ok
    const childData = {
      name,
      email,
      createdAt: admin.firestore.Timestamp.now(),
    }
    await db.doc(`admins/${adminUid}/children/${childUid}`).set(childData);
    // send invite

    const invitationData = {
      fromUid: adminUid,
      toUid: childUid,
      type: "childInvitation",
      fromDisplay: true,
      toDisplay: true,
      createdAt: admin.firestore.Timestamp.now()
    };
    await db.doc(`/admins/${childUid}/messages/childInvitation${adminUid}`).set(invitationData);
    return {};
  } catch (error) {
    throw utils.process_error(error)
  }

}
