import * as constant from '../common/constant';
import * as utils from '../stripe/utils'

/*
const chunk = (array, chunkSize) => {
  const ret: any[] = [];
  let tmp: any[] = [];
  for (let i = 0; i < array.length; i += chunkSize)
    tmp = array.slice(i, i + chunkSize);
    ret.push(tmp);
  return ret;
}
*/
const getMenuObj = async (refRestaurant) => {
  /*
  // todo: if this bug will fix.  https://github.com/googleapis/nodejs-firestore/issues/990
  const menuIdChunks = chunk(Object.keys(original_data.order), 10);

  for(let i = 0; i < menuIdChunks.length; i ++) {
    const menuIds = menuIdChunks[i];
    const menusCollections = await refRestaurant.collection("menus").where(admin.firestore.FieldPath.documentId(), 'in', menuIds);

    menusCollections.forEach((a) => {
      menus[a.id] = a.data();
    });
  };
  */
  const menuObj = {};
  const menusCollections = await refRestaurant.collection("menus").get();
  menusCollections.forEach((m) => {
    menuObj[m.id] = m.data();
  });
  return menuObj;
};

export const wasOrderCreated = async (db, snapshot, context) => {
  const original_data = snapshot.data()

  if (!original_data || !original_data.status || original_data.status !== constant.order_status.new_order) {
    return;
  }

  // get restaurant
  try {
    const refRestaurant = snapshot.ref.parent.parent;
    const restaurantDoc = await refRestaurant.get();
    if (!restaurantDoc.exists) {
      return snapshot.ref.update("status", constant.order_status.error);
    }
    const restaurant = restaurantDoc.data();

    // tax rate
    const alcoholTax = restaurant.alcoholTax || 0;
    const foodTax = restaurant.foodTax || 0;

    const menuObj = await getMenuObj(refRestaurant);

    let food_sub_total = 0;
    let alcohol_sub_total = 0;

    Object.keys(original_data.order).map((menuId) => {
      const menu = menuObj[menuId];
      if (menu.tax === "alcohol") {
        alcohol_sub_total += (menu.price * original_data.order[menuId])
      } else {
        food_sub_total += (menu.price * original_data.order[menuId])
      }
    });

    const multiple = utils.stripe_region.multiple; //100 for USD, 1 for JPY
    // calculate price.
    const sub_total = food_sub_total + alcohol_sub_total;
    const tax = Math.round(((alcohol_sub_total * alcoholTax) / 100 + (food_sub_total * foodTax) / 100) * multiple) / multiple;
    const total = sub_total + tax;

    // Atomically increment the orderCount of the restaurant
    let number = 0;
    await db.runTransaction(async (tr) => {
      if (restaurant) {
        number = restaurant.orderCount || 0;
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
  } catch (e) {
    console.log(e);
    return snapshot.ref.update("status", constant.order_status.error);

  }
}
/* We no longer use this code, but keep it here for future for custom URL.
export const createRestaurant = async (db: FirebaseFirestore.Firestore, data, context) => {
  const { restaurantId } = data
  if (!context.auth || !context.auth.uid || !context.auth.token.email) {
    return { result: false, message: "auth.notAdmin" };
  }
  const regex = /^\w+$/
  if (!restaurantId || restaurantId.length < 5 || !regex.test(restaurantId)) {
    return { result: false, message: "restaurantId.invalid" };
  }
  const refRestaurant = db.doc(`restaurants/${restaurantId}`)
  return db.runTransaction(async (tr) => {
    const doc = await tr.get(refRestaurant);
    if (doc.exists) {
      throw new Error("restaurantId.alreadyTaken");
    }
    tr.set(refRestaurant, {
      uid: context.auth.uid,
      publicFlag: false,
      deletedFlag: false,
      createdAt: admin.firestore.Timestamp.now(),
    });
  }).then(() => {
    return { result: true };
  }).catch((e) => {
    return { result: false, message: e.message };
  });
}
*/
