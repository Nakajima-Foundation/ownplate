import * as firebase from 'firebase-admin';

import * as functions from 'firebase-functions'
// import * as admin from 'firebase-admin';
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

    const user = await firebase.auth().getUserByEmail(email)
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
    const childRef = db.doc(`admins/${adminUid}/children/${childUid}`)
    const childDoc = await childRef.get()
    if (childDoc && childDoc.exists) {
      throw new functions.https.HttpsError('invalid-argument', 'Already invited.')
    }

    // ok
    const childData = {
      name,
      email,
      createdAt: firebase.firestore.Timestamp.now(),
    }
    await childRef.set(childData);
    // send invite

    const invitationData = {
      fromUid: adminUid,
      toUid: childUid,
      type: "childInvitation",
      fromDisplay: true,
      toDisplay: true,
      email,
      createdAt: firebase.firestore.Timestamp.now()
    };
    await db.doc(`/admins/${childUid}/messages/childInvitation${adminUid}`).set(invitationData);
    return {
      result: true,
      childUid: childUid
    };
  } catch (error) {
    throw utils.process_error(error)
  }

}

export const invitationValidateProcess = async (db, data: any, context: functions.https.CallableContext | Context,
                                                callback: (adminUid: string, messageData: firebase.firestore.DocumentData,
                                                           messageRef: firebase.firestore.DocumentReference) => Promise<void>) => {
  // check admin and is not child yet.
  const { messageId } = data;
  const adminUid = utils.validate_parent_admin_auth(context);

  // check message
  const messageRef = db.doc(`/admins/${adminUid}/messages/${messageId}`);
  const messageDoc = await messageRef.get();
  if (!messageDoc) {
    throw new functions.https.HttpsError('invalid-argument', 'This message does not exist.')
  }
  const messageData = messageDoc.data();
  await callback(adminUid, messageData, messageRef);
  return {};
}
const childInvitationProcess = async (db: any, data: any, context: functions.https.CallableContext | Context,
                                      callback: (messageData: firebase.firestore.DocumentData, messageRef: firebase.firestore.DocumentReference) => Promise<void>) => {
  await invitationValidateProcess(db, data, context, async (adminUid: string, messageData: firebase.firestore.DocumentData, messageRef: firebase.firestore.DocumentReference) => {
    if (messageData.type === "childInvitation") {
      // validation
      if (messageData.toDisplay === false) {
        throw new functions.https.HttpsError('invalid-argument', 'This message is expired.')
      }
      if (messageData.toUid !== adminUid) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid User access.')
      }
      // ok!!
      await callback(messageData, messageRef);
    } else {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid invitation type.')
    }
  });
};
export const accept = async (db, data: any, context: functions.https.CallableContext | Context) => {
  try {
    await childInvitationProcess(db, data, context, async (messageData, messageRef) => {
      await db.runTransaction(async (tr) => {

        const customClaims = { parentUid: messageData.fromUid };
        await firebase.auth().setCustomUserClaims(messageData.toUid, customClaims);

        const childRef = db.doc(`admins/${messageData.fromUid}/children/${messageData.toUid}`);
        await tr.get(childRef);
        await tr.get(messageRef);

        const childDoc = await tr.get(childRef);
        const messageDoc = await tr.get(messageRef);

        if (!childDoc || !childDoc.exists || !messageDoc || !messageDoc.exists) {
          throw new functions.https.HttpsError('invalid-argument', `The child or message does not exist.`)
        }
        //  accepted
        await tr.update(childRef, {accepted: true})

        // update invitationData
        await tr.update(messageRef, {toDisplay: false, accepted: true});
        return {};
      });
    });
  } catch (error) {
    throw utils.process_error(error)
  }
  return {};
}
export const deny = async (db, data: any, context: functions.https.CallableContext | Context) => {
  try {
    await childInvitationProcess(db, data, context, async (messageData, messageRef) => {
      await db.runTransaction(async (tr) => {

        const childRef = db.doc(`admins/${messageData.fromUid}/children/${messageData.toUid}`);
        const childDoc = await tr.get(childRef);
        const messageDoc = await tr.get(messageRef);

        if (!childDoc || !childDoc.exists || !messageDoc || !messageDoc.exists) {
          throw new functions.https.HttpsError('invalid-argument', `The child or message does not exist.`)
        }
        //  deny
        await tr.delete(childRef)

        // update invitationData
        await tr.update(messageRef, {toDisplay: false, accepted: false});
        return {};
      });
    });
  } catch (error) {
    throw utils.process_error(error)
  }
  return {};
}

export const deleteChild = async (db, data: any, context: functions.https.CallableContext | Context) => {
  // check admin
  const adminUid = utils.validate_parent_admin_auth(context);
  const { childUid } = data;

  try {
    await db.runTransaction(async (tr) => {

      const childRef = db.doc(`admins/${adminUid}/children/${childUid}`);
      const childDoc = await tr.get(childRef);

      const messageRef = db.doc(`/admins/${childUid}/messages/childInvitation${adminUid}`);
      const messageDoc = await tr.get(messageRef);

      if (!childDoc || !childDoc.exists || !messageDoc || !messageDoc.exists) {
        throw new functions.https.HttpsError('invalid-argument', `The child or message does not exist.`)
      }
      // ok!!
      const customClaims = { };
      await firebase.auth().setCustomUserClaims(childUid, customClaims);

      await tr.delete(childRef)
      await tr.delete(messageRef)
    });
  } catch (error) {
    throw utils.process_error(error)
  }
  return { retult: true};
}
