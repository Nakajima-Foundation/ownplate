import express from 'express';
import * as admin from 'firebase-admin';
// import { ownPlateConfig } from '../common/project';

import moment from 'moment';

export const apiRouter = express.Router();

if (!admin.apps.length) {
  admin.initializeApp();
}

let db = admin.firestore();

export const updateDb = (_db) => {
  db = _db;
}

export const response200 = (res, payload) => {
  return res.json({
    result: true,
    payload,
  });
};

//const hostname = "https://" + ownPlateConfig.hostName;

const getRestaurantData = async (restaurantId) => {
  const restaurant = await db.doc(`restaurants/${restaurantId}`).get();
  if (!restaurant || !restaurant.exists) {
    return null;
  }
  const restaurant_data: any = restaurant.data();
  if (!restaurant_data.publicFlag || restaurant_data.deletedFlag) {
    return null;
  }
  return restaurant_data;
};

const getRestaurantApiKey = async (restaurantId) => {
  const apiKey = await db.doc(`restaurants/${restaurantId}/private/apikey`).get();
  if (!apiKey || !apiKey.exists) {
    return null;
  }
  const apiKeyData: any = apiKey.data();
  return apiKeyData;
};

export const getRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;

  const restaurant_data = await getRestaurantData(restaurantId);
  if (restaurant_data === null) {
    return res.status(404).send("");
  }
  req.restaurant_data = restaurant_data;
  req.restaurantId = restaurantId;
  next();
}
export const apiKeyAuth = async (req, res, next) => {
  const authorization = (req.headers['authorization']||"").split(" ")[1];
  if (authorization === null || authorization === undefined) {
    return res.status(401).send("");
  }

  const apiKey = await getRestaurantApiKey(req.restaurantId);
  if (apiKey === null) {
    return res.status(401).send("");
  }
  if (authorization !== apiKey.apikey) {
    return res.status(401).send("");
  }
  next();
};
export const nameOfOrder = (order) => {
  return (order && order.number !== undefined) ?
    "#" + `00${order.number}`.slice(-3) : "";
};


const convTime = (time: any) => {
  if (time === null || time === undefined) {
    return null;
  }
  try {
    return time && moment(time.toDate()).format("YYYY/MM/DD HH:mm");
  } catch (e) {
    return time && moment(time.seconds * 1000).format("YYYY/MM/DD HH:mm");
  }
  
};

const getOrders = async (req: any, res: any) => {
  const refRestaurant = db.doc(`restaurants/${req.restaurantId}`);
  const orderCollection = await refRestaurant.collection('orders').orderBy("timeCreated", "desc").get();

  try {
    const orders = orderCollection.docs.map((item) => {
      const order = item.data();
      order.id = item.id;
      return order;
    }).filter((order) => {
      return (order.status >= 300);
    }).map((order) => {
      const menus = order.menuItems || {};

      const items = Object.keys(order.order).reduce((tmp, menuId) => {
        const __order  = order.order[menuId];
        const menu = menus[menuId] || {};
        (Array.isArray(__order) ? __order : [__order]).map((num, key) => {
          const orderItem = {
            menuId: menuId,
            name: menu.itemName,
            quantity: num,
            options: ((order.options ||{})[menuId]||{})[key],
            basePrice: menu.price,
            subTotal: ((order.prices || {})[menuId]||{})[key],

          } as any;
          tmp.push(orderItem);
        });
        return tmp;
      }, [] as any[]);
      const ret = {
        id: order.id,
        name: nameOfOrder(order),
        status: order.status,
        orderPlacedAt: convTime(order.orderPlacedAt),
        orderAcceptedAt: convTime(order.orderAcceptedAt),
        timeConfirmed: convTime(order.timeConfirmed),
        transactionCompletedAt: convTime(order.transactionCompletedAt),
        orderRestaurantCanceledAt: convTime(order.orderRestaurantCanceledAt),
        orderCustomerCanceledAt: convTime(order.orderCustomerCanceledAt),
        // timeRequested: convTime(order.timePlaced),
        // dateConfirmed: convTime(order.timeConfirmed),
        items,
        payment: {
          tax: order.tax,
          tip: order.tip,
          subTotal: order.sub_total,
          total: order.totalCharge,
          method: order.payment?.stripe ? "stripe" : "cash",
        },
        accounting: order.accounting,
      };
      return ret;
    });
    const restaurant = {
      id: req.restaurantId,
      inclusiveTax: req.restaurant_data.inclusiveTax,
      name: req.restaurant_data.restaurantName,
    };
    return response200(res, {
      orders, 
      restaurant,
    });
  } catch (e) {  
    console.log(e);
    return res.status(500).send("");
  }
}


apiRouter.get('/restaurants/:restaurantId/orders', getRestaurant, apiKeyAuth, getOrders);
