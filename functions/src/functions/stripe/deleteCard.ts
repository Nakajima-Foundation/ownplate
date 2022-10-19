import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as utils from "../../lib/utils";

// func
export const deleteCard = async (db: admin.firestore.Firestore, context: functions.https.CallableContext) => {
  const customerUid = utils.validate_customer_auth(context);

  try {
    // retrieve the customerId from uid
    const refStripeSystem = db.doc(`/users/${customerUid}/system/stripe`);
    const stripeInfo = (await refStripeSystem.get()).data();
    if (!stripeInfo) {
      return { return: true };
    }
    const customerId = stripeInfo.customerId;

    // retrieve the default cardId from the customerId and delete it
    const stripe = utils.get_stripe();
    const customer = (await stripe.customers.retrieve(customerId)) as any;
    const sourcesData = customer?.sources?.data;
    let cardId = null;
    if (sourcesData.length > 0) {
      cardId = sourcesData[0].id;
      await stripe.customers.deleteSource(customerId, cardId!);
    }

    // delete the stripe information on the database associated with this user
    await refStripeSystem.delete();
    const refStripeReadOnly = db.doc(`/users/${customerUid}/readonly/stripe`);
    await refStripeReadOnly.delete();

    return { return: true, cardId };
  } catch (error) {
    throw utils.process_error(error);
  }
};
