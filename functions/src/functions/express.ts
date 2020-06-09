import express from 'express';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { ownPlateConfig } from '../common/project';

import * as Sentry from '@sentry/node';

import * as utils from '../lib/utils'
import * as stripeLog from '../lib/stripeLog';

import { SitemapStream, streamToPromise } from 'sitemap';

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

export const sitemap_response = async (req, res) => {
  try {
    const smStream = new SitemapStream({ hostname: "https://" + ownPlateConfig.hostName })
    const docs = (await db.collection("restaurants").get()).docs;
    await Promise.all(docs.map(async doc => {
      // console.log(doc.data());
      // console.log(doc.id);
      smStream.write({ url: '/r/' + doc.id})
    }));
    smStream.end()

    const response = await streamToPromise( smStream ).then( data => data.toString() );
    return res.send(response);
  } catch (e) {
    console.error(e)
    return res.status(500).end()
  }
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
  const template_data = fs.readFileSync('./templates/index.html', { encoding: 'utf8' });
  try {
    const restaurant = await db.doc(`restaurants/${restaurantName}`).get();


    if (!restaurant || !restaurant.exists) {
      return res.status(404).send(template_data);
    }
    const restaurant_data: any = restaurant.data();

    const siteName = ownPlateConfig.siteName;
    const title = restaurant_data.restaurantName || ownPlateConfig.siteName;
    const image = (restaurant_data?.images?.profile?.resizedImages || {})["600"] ||
      restaurant_data.restProfilePhoto;
    const description = restaurant_data.introduction || ownPlateConfig.siteDescription;
    const regexTitle = /<title.*title>/;
    const metas =
      [
        `<title>${escapeHtml(title)}</title>`,
        `<meta data-n-head="1" charset="utf-8">`,
        `<meta property="og:title" content="${escapeHtml(title)}" />`,
        `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:url" content="https://${ownPlateConfig.hostName}/r/${restaurantName}" />`,
        `<meta property="og:description" content="${escapeHtml(description)}" />`,
        `<meta property="og:image" content="${image}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:site" content="@omochikaericom" />`,
        `<meta name="twitter:creator" content="@omochikaericom" />`,
        `<meta name="twitter:description" content="${description}" />`,
        `<meta name="twitter:image" content="${image}" />`,
      ].join("\n");
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.send(template_data.replace(/<meta[^>]*>/g, "").replace(regexTitle, metas));
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    res.send(template_data);
  }

};
const debugError = async (req: any, res: any) => {
  setTimeout(() => {
    throw new Error("sample error");
    res.send({});
  }, 10);
};

export const stripe_parser = async (req, res) => {
  const stripe = utils.get_stripe();
  const endpointSecret = utils.getStripeWebhookSecretKey();

  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody.toString(), sig, endpointSecret);

    // const {data:{object}} = event
    if (!event) {
      return res.status(400).send(`Webhook Error: unknow error`);
    }

    if (event.type === "capability.updated") {
      await stripeLog.capability_updated(db, event)
    } else if (event.type === "account.updated") {
      await stripeLog.account_updated(db, event);
    }
    res.json({});
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};




router.post('/stripe/callback',
            logger,
            stripe_parser);


app.use('/1.0', router);

app.get('/r/:restaurantName', ogpPage);
app.get('/r/:restaurantpName/*', ogpPage);


app.get('/sitemap.xml', sitemap_response);

app.get('/debug/error', debugError);
