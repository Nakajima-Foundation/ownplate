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

  // todo create stripe payment request
  snapshot.ref.update({
    status: constant.order_status.validation_ok,

    sub_total,
    tax,
    total
  });
}

export const createRestaurant = async (db:FirebaseFirestore.Firestore, data, context) => {
  const { restaurantId } = data
  if (!context.auth || !context.auth.uid) {
    return { result:false, message:"auth.uid.missing" }; 
  }
  const regex = /^\w+$/
  if (!restaurantId || restaurantId.length < 5 || !regex.test(restaurantId)) {
    return { result:false, message:"restaurantId.invalid" }; 
  }
  const refRestaurant = db.doc(`restaurants/${restaurantId}`)
  return db.runTransaction(async (tr)=>{
    const doc = await tr.get(refRestaurant);
    if (doc.exists) {
      throw new Error("restaurantId.taken");
    }
    tr.set(refRestaurant, { owner:context.auth.uid, draft:true });
  }).then(() => {
    return { result: true };
  }).catch((e) => {
    return { result: false, message: e.message };
  });
}
