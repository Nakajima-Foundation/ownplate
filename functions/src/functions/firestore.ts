import * as admin from 'firebase-admin';
import * as constant from '../common/constant';

export const orderCreate = async (db, snapshot, context) => {
  // const { restaurantId, orderId } = context.params;
  const original_data = snapshot.data()
  // todo validate order data
  if (!original_data || !original_data.status || original_data.status !== constant.order_status.new_order) {
    return ;
  }

  // todo calculate price.
  const sub_total = 2000;
  const tax = 200;
  const total = sub_total+ tax;

  // Atomically increment the orderCount of the restaurant
  const refRestaurant = snapshot.ref.parent.parent;
  let number = 0;
  await db.runTransaction(async (tr)=>{
    const doc = await tr.get(refRestaurant);
    const data = doc.data();
    if (data) {
      number = data.orderCount || 0;
      await tr.update(refRestaurant, {
        orderCount: (number + 1) % 1000000
      });
    }
  });

  // todo create stripe payment request
  return snapshot.ref.update({
    status: constant.order_status.validation_ok,
    number,
    sub_total,
    tax,
    total
  });
}

export const createRestaurant = async (db:FirebaseFirestore.Firestore, data, context) => {
  const { restaurantId } = data
  if (!context.auth || !context.auth.uid || !context.auth.token.email) {
    return { result:false, message:"auth.notAdmin" };
  }
  const regex = /^\w+$/
  if (!restaurantId || restaurantId.length < 5 || !regex.test(restaurantId)) {
    return { result:false, message:"restaurantId.invalid" };
  }
  const refRestaurant = db.doc(`restaurants/${restaurantId}`)
  return db.runTransaction(async (tr)=>{
    const doc = await tr.get(refRestaurant);
    if (doc.exists) {
      throw new Error("restaurantId.alreadyTaken");
    }
    tr.set(refRestaurant, {
      uid: context.auth.uid,
      publicFlag: false,
      created: admin.firestore.Timestamp.now(),
    });
  }).then(() => {
    return { result: true };
  }).catch((e) => {
    return { result: false, message: e.message };
  });
}
