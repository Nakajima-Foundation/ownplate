import express from 'express';
import * as admin from 'firebase-admin';
import { ownPlateConfig } from '../common/project';
import cors from 'cors'
import * as Sentry from '@sentry/node';

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

const hostname = "https://" + ownPlateConfig.hostName;

const num2time = (num) => {
  return [
    String(Math.floor(num / 60)).padStart(2, '0'),
    ":",
    String(num % 60).padStart(2, '0'),
  ].join("");
};

const week = {
  "7": "日曜",
  "1": "月曜",
  "2": "火曜",
  "3": "水曜",
  "4": "木曜",
  "5": "金曜",
  "6": "土曜",
};

const getRestaurants = async (req: any, res: any) => {
  try {
    const docs = (await db.collection("restaurants")
                  .where("publicFlag", "==", true)
                  .where("deletedFlag", "==", false)
                  .orderBy("updatedAt", "desc")
                  .limit(20)
                  .get()).docs;
    const restaurants = await Promise.all(docs.map(async doc => {
      const {
        restaurantName, ownerName, introduction, location, url,  phoneNumber,
        zip, state, city, streetAddress,
        images,
        businessDay, openTimes,
      } = doc.data();

      const converBusinessDay = Object.keys(week).map((key) => {
        const openTime = (businessDay[key]) ? openTimes[key].sort((a, b) => {
          return a["start"] > b["start"];
        }).map((a) => {
          return {
            start: num2time(a["start"]),
            end: num2time(a["end"])
          };
        }) : [];

        return {
          day: Number(key),
          name: week[key],
          isOpen: businessDay[key],
          openTime,
        };
      });
      const ret = {
        id: doc.id,
        url: hostname + "/r/" + doc.id,
        info: {
          name: restaurantName,
          ownerName,
          introduction,
          location,
          url,
          phoneNumber
        },
        address: {
          zip, state, city, streetAddress,
        },
        images: {
          cover: (images?.cover?.resizedImages || {})['600'] || null,
          profile: (images?.profile?.resizedImages || {})['600'] || null,
        },
        businessDay: converBusinessDay,
      };
      return ret;
    }));
    return response200(res, {restaurants});
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    return res.status(500).end()
  }
};

const getMenus = async (req: any, res: any) => {
  const { restaurantId } = req.params;

  const restaurant = await db.doc(`restaurants/${restaurantId}`).get();
  if (!restaurant || !restaurant.exists) {
    return res.status(404).send("");
  }
  const restaurant_data: any = restaurant.data();
  if (!restaurant_data.publicFlag || restaurant_data.deletedFlag) {
    return res.status(404).send("");
  }
  const docs = (await db.collection(`restaurants/${restaurantId}/menus`)
                .where("publicFlag", "==", true)
                .where("deletedFlag", "==", false)
                .limit(20)
                .get()).docs;
  const menus = await Promise.all(docs.map(async doc => {
    const {
      itemName, itemDescription, images,
      price, tax,
      allergens,
      itemOptionCheckbox,
    } = doc.data();
    return {
      id: doc.id,
      url: hostname + "/r/" + restaurantId + "/menus/" + doc.id,
      itemInfo: {
        name: itemName,
        description: itemDescription,
        image: (images?.item?.resizedImages || {})['600'] || null,
      },
      price: {
        price,
        tax,
      },
      allergens,
      itemOptionCheckbox,
    };
  }));
  return response200(res, {menus});
}

const corsOptionsDelegate = (req, callback) => {
  // firebaseapp.com, web.app, localhost:3000/*
  const pattern = /(http:\/\/localhost:\d+)$|(https:\/\/[a-zA-Z0-9\-]+\.firebaseapp\.com)$|(https:\/\/[a-zA-Z0-9\-]+\.web\.app)$/
  const corsOptions = ((req.header('Origin')||"").match(pattern)) ?
    { origin: true } : { origin: false };
  callback(null, corsOptions) // callback expects two parameters: error and options
}

apiRouter.get('/restaurants', cors(corsOptionsDelegate), getRestaurants);
apiRouter.get('/restaurants/:restaurantId/menus', cors(corsOptionsDelegate), getMenus);
