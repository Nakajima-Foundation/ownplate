import * as functions from 'firebase-functions'
import * as utils from '../lib/utils'

export const createCustomer = async (db: FirebaseFirestore.Firestore, uid: string, phoneNumber: string) => {
  const stripe = utils.get_stripe();
  await db.runTransaction(async (tr) => {
    const refStripe = db.doc(`/users/${uid}/system/stripe`)
    const stripeInfo = (await tr.get(refStripe)).data();

    // Create a stripe customer if we haven't created yet
    if (!stripeInfo) {
      const customer = await stripe.customers.create({
        description: phoneNumber,
        metadata: { uid, phoneNumber }
      })
      tr.set(refStripe, {
        customerId: customer.id
      })
    }
  });
}

export const deleteCard = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);

  try {
    // retrieve the customerId from uid
    const refStripeSystem = db.doc(`/users/${uid}/system/stripe`)
    const stripeInfo = (await refStripeSystem.get()).data();
    if (!stripeInfo) {
      return { return: true }
    }
    const customerId = stripeInfo.customerId

    // retrieve the default cardId from the customerId and delete it
    const stripe = utils.get_stripe();
    const customer = await stripe.customers.retrieve(customerId) as any;
    const sourcesData = customer?.sources?.data;
    let cardId = null;
    if (sourcesData.length > 0) {
      cardId = sourcesData[0].id;
      await stripe.customers.deleteSource(customerId, cardId!);
    }

    // delete the stripe information on the database associated with this user
    await refStripeSystem.delete();
    const refStripeReadOnly = db.doc(`/users/${uid}/readonly/stripe`)
    await refStripeReadOnly.delete();

    return { return: true, cardId }
  } catch (error) {
    throw utils.process_error(error)
  }
}

export const deleteCustomer = async (db: FirebaseFirestore.Firestore, uid: string) => {
  const stripe = utils.get_stripe();
  const refStripeSystem = db.doc(`/users/${uid}/system/stripe`)
  const refStripeReadOnly = db.doc(`/users/${uid}/readonly/stripe`)
  await db.runTransaction(async (tr) => {
    const stripeInfo = (await tr.get(refStripeSystem)).data();
    if (stripeInfo) {
      tr.delete(refStripeSystem);
      tr.delete(refStripeReadOnly);
      try {
        await stripe.customers.del(stripeInfo.customerId);
      } catch (error) {
        // This happens if the customer was removed from the Stripe console.
        // Therefore, it is fine to ignore this error.
        console.error(error);
      }
    }
  })
}

export const update = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const { tokenId, reuse } = data;
  utils.validate_params({ tokenId });
  const stripe = utils.get_stripe();

  const refStripeSystem = db.doc(`/users/${uid}/system/stripe`)
  const refStripeReadOnly = db.doc(`/users/${uid}/readonly/stripe`)

  try {
    const token = await stripe.tokens.retrieve(tokenId);
    const card = {
      last4: token.card?.last4,
      brand: token.card?.brand,
      exp_month: token.card?.exp_month,
      exp_year: token.card?.exp_year
    }
    console.log("***token", token);
    await db.runTransaction(async (tr) => {
      const stripeInfo = (await tr.get(refStripeSystem)).data();
      if (!stripeInfo) {
        throw new functions.https.HttpsError('invalid-argument', 'This user does not have a stripe customer.')
      }
      // Store the stripe info in the readonly area (accessible from the client) only if the user wants to reuse it.
      // Notice that we still need to associate the stripe info the the customer internally.
      if (reuse) {
        tr.set(refStripeReadOnly, {
          card
        }, { merge: true })
      } else {
        // We need to delete the old card info (if exists). Otherwise, the new one will become the default and
        // will be reused (even though the end-user unchecks the "re-user" checkbox).
        // This is a little bit incombinient (the user can not reuse the first one any more,
        // after using the second one even though she/he uncheks the 'reuse' button), but this is better
        // than introducing the complexity of managing multiple cards.
        tr.delete(refStripeReadOnly)
      }

      await stripe.customers.update(stripeInfo.customerId, {
        source: tokenId
      })
    });

    return { success: true }
  } catch (error) {
    throw utils.process_error(error)
  }

}
