import express from 'express';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { getRegionalSetting } from '../stripe/utils'
import * as line from '@line/bot-sdk'
import * as functions from 'firebase-functions'
import * as project from '../common/project';

export const app = express();
export const router = express.Router();

// for test, db is not immutable
if (!admin.apps.length) {
  admin.initializeApp();
}

let db = admin.firestore();

export const updateDb = (_db) => {
  db = _db;
}

export const logger = async (req, res, next) => {
  next();
}
export const hello_response = async (req, res) => {
  res.json({ message: "hello" });
};

const escapeHtml = (str: string): string => {
  if (typeof str !== 'string') {
    return '';
  }
  const mapping: any = {
    '&': '&amp;',
    "'": '&#x27;',
    '`': '&#x60;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
  };
  return str.replace(/[&'`"<>]/g, function (match) {
    return mapping[match]
  });
}


const ogpPage = async (req: any, res: any) => {

  const { restaurantName } = req.params;
  const restaurant = await db.doc(`restaurants/${restaurantName}`).get();

  const template_data = fs.readFileSync('./templates/index.html', { encoding: 'utf8' });

  if (!restaurant || !restaurant.exists) {
    return res.status(404).send(template_data);
  }
  const regionalSetting = getRegionalSetting();
  const restaurant_data: any = restaurant.data();

  const title = restaurant_data.restaurantName;
  const image = restaurant_data.restProfilePhoto;

  const regex = /<title.*title>/;
  const metas =
    [
      `<title>${escapeHtml(title)}</title>`,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
      `<meta property="og:site_name" content="${escapeHtml(title)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:url" content="https://${regionalSetting.hostName}/r/${restaurantName}" />`,
      `<meta property="og:description" content="Japanese comfort food" />`,
      `<meta property="og:image" content="${image}" />`,
    ].join("\n");

  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  res.send(template_data.replace(regex, metas));

};
const debugError = async (req: any, res: any) => {
  setTimeout(() => {
    throw new Error("sample error");
    res.send({});
  }, 10);
};

router.get('/hello',
  logger,
  hello_response);

router.get('/stripe/callback',
  logger,
  hello_response);


app.use('/1.0', router);

app.get('/r/:restaurantName', ogpPage);
app.get('/r/:restaurantpName/*', ogpPage);

app.get('/debug/error', debugError);

const config = {
  channelAccessToken: project.ownPlateConfig.LINE_CHANNEL_ID,
  channelSecret: functions.config().line.secret
};
// create LINE SDK client
const client = new line.Client(config);

router.get('/line', (req, res) => {
  res.json({ message: "hello line" });
});

router.get('/1.0/line', (req, res) => {
  res.json({ message: "hello line 1.0" });
});

router.post('/1.0/line', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event: any) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text } as line.TextMessage;

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}
