import express from "express";
import * as admin from "firebase-admin";
import * as fs from "fs";
import { ownPlateConfig } from "../common/project";

import * as Sentry from "@sentry/node";

import * as utils from "../lib/utils";
import * as stripeLog from "../lib/stripeLog";

import * as apis from "./apis";
import * as apis2 from "./apis2";

import * as smaregi from "./smaregiApi";

import * as xmlbuilder from "xmlbuilder";

import moment from "moment";

export const app = express();
export const router = express.Router();

// for test, db is not immutable
if (!admin.apps.length) {
  admin.initializeApp();
}

let db = admin.firestore();

export const updateDb = (_db) => {
  db = _db;
  apis.updateDb(db);
  apis2.updateDb(db);
};

export const logger = async (req, res, next) => {
  next();
};
export const hello_response = async (req, res) => {
  res.json({ message: "hello" });
};

const lastmod = (restaurant) => {
  try {
    if (restaurant.updatedAt) {
      return moment(restaurant.updatedAt.toDate()).format("YYYY-MM-DD");
    }
    if (restaurant.createdAt) {
      return moment(restaurant.createdAt.toDate()).format("YYYY-MM-DD");
    }
  } catch (e) {
    console.log(e);
  }
  return "2020-07-01";
};

export const sitemap_response = async (req, res) => {
  try {
    const hostname = "https://" + ownPlateConfig.hostName;

    const urlset = xmlbuilder.create("urlset").att("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

    const docs = (await db.collection("restaurants").where("publicFlag", "==", true).where("deletedFlag", "==", false).orderBy("updatedAt", "desc").get()).docs;
    await Promise.all(
      docs.map(async (doc) => {
        const url = urlset.ele("url");
        url.ele("loc", hostname + "/r/" + doc.id);
        url.ele("lastmod", lastmod(doc.data()));
      })
    );

    const xml = urlset.dec("1.0", "UTF-8").end({ pretty: true });

    res.setHeader("Content-Type", "text/xml");
    res.send(xml);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    return res.status(500).end();
  }
};

const escapeHtml = (str: string): string => {
  if (typeof str !== "string") {
    return "";
  }
  const mapping: any = {
    "&": "&amp;",
    "'": "&#x27;",
    "`": "&#x60;",
    '"': "&quot;",
    "<": "&lt;",
    ">": "&gt;",
  };
  return str.replace(/[&'`"<>]/g, function (match) {
    return mapping[match];
  });
};

const getMenuData = async (restaurantName, menuId) => {
  if (menuId) {
    const menu = await db.doc(`restaurants/${restaurantName}/menus/${menuId}`).get();
    if (menu && menu.exists) {
      const menu_data: any = menu.data();
      return {
        image: (menu_data?.images?.item?.resizedImages || {})["600"] || menu_data.itemPhoto,
        description: menu_data?.itemDescription,
        name: menu_data?.itemName,
        exists: true,
      };
    }
  }
  return {
    exists: false,
  };
};
const isId = (id: string) => {
  return /^[a-zA-Z0-9]+$/.test(id);
};
const ogpPage = async (req: any, res: any) => {
  const { restaurantName, menuId } = req.params;
  const template_data = fs.readFileSync("./templates/index.html", {
    encoding: "utf8",
  });
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-Frame-Options", "deny");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Referrer-Policy", "no-referrer");
  try {
    if (!isId(restaurantName)) {
      return res.status(404).send(template_data);
    }
    if (menuId && !isId(menuId)) {
      return res.status(404).send(template_data);
    }
    const restaurant = await db.doc(`restaurants/${restaurantName}`).get();

    if (!restaurant || !restaurant.exists) {
      return res.status(404).send(template_data);
    }
    const restaurant_data: any = restaurant.data();
    if (restaurant_data.deletedFlag || !restaurant_data.publicFlag) {
      return res.status(404).send(template_data);
    }

    const menuData = await getMenuData(restaurantName, menuId);

    const ownerData = await getShopOwner(restaurant_data.uid);
    if (!ownerData) {
      return res.status(404).send(template_data);
    }

    const siteName = ownPlateConfig.siteName;
    const title = menuData.exists
      ? [menuData.name, restaurant_data.restaurantName].join(" / ")
      : restaurant_data.restaurantName
      ? [restaurant_data.restaurantName, ownPlateConfig.restaurantPageTitle].join(" / ")
      : ownPlateConfig.siteName;
    const image =
      menuData.image ||
      (restaurant_data?.images?.cover?.resizedImages || {})["600"] ||
      restaurant_data.restCoverPhoto ||
      (restaurant_data?.images?.profile?.resizedImages || {})["600"] ||
      restaurant_data.restProfilePhoto;
    const description = menuData.description || restaurant_data.introduction || ownPlateConfig.siteDescription;
    const regexTitle = /<title.*title>/;

    const url = menuData.exists
      ? `https://${ownPlateConfig.hostName}/r/${restaurantName}/menus/${escapeHtml(menuId)}`
      : `https://${ownPlateConfig.hostName}/r/${escapeHtml(restaurantName)}`;

    const metas = [
      `<title>${escapeHtml(title)}</title>`,
      `<meta data-n-head="1" charset="utf-8">`,
      `<meta data-n-head="1" name="viewport" content="width=device-width,initial-scale=1">`,
      `<meta name="description" content="${escapeHtml(description)}"/>`,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
      `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta property="og:image" content="${image}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:site" content="@omochikaericom" />`,
      `<meta name="twitter:creator" content="@omochikaericom" />`,
      `<meta name="twitter:description" content="${description}" />`,
      `<meta name="twitter:image" content="${image}" />`,
    ];
    if (ownerData.hidePrivacy) {
      metas.push(`<meta name="robots" content="noindex" />`);
    }
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");

    const regexBody = /<div id="app">/;

    const bodyString = [
      '<div id="app">',
      '<h1 style="font-size: 50px;">',
      escapeHtml(title),
      "</h1>",
      '<span style="font-size: 30px;">',
      escapeHtml(restaurant_data.introduction),
      "</span>",
    ].join("\n");

    res.send(
      template_data
        .replace(/<meta[^>]*>/g, "")
        .replace(regexTitle, metas.join("\n"))
        .replace(regexBody, bodyString)
    );
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    res.send(template_data);
  }
};

const ownerPage = async (req: any, res: any) => {
  const { ownerId } = req.params;
  const template_data = fs.readFileSync("./templates/index.html", {
    encoding: "utf8",
  });
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-Frame-Options", "deny");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Referrer-Policy", "no-referrer");
  try {
    if (!isId(ownerId)) {
      return res.status(404).send(template_data);
    }
    const ownerData = await getOwnerData(ownerId);
    if (!ownerData) {
      return res.send(template_data);
    }

    const siteName = ownPlateConfig.siteName;
    const title = [ownerData.name].join(" / ");
    const image = (ownerData?.images?.cover?.resizedImages || {})["600"];
    const description = ownerData.description;
    const regexTitle = /<title.*title>/;
    const url = `https://${ownPlateConfig.hostName}/o/${ownerId}`;

    const metas = [
      `<title>${escapeHtml(title)}</title>`,
      `<meta data-n-head="1" charset="utf-8">`,
      `<meta data-n-head="1" name="viewport" content="width=device-width,initial-scale=1">`,
      `<meta name="description" content="${escapeHtml(description)}"/>`,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
      `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta property="og:image" content="${image}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:site" content="@omochikaericom" />`,
      `<meta name="twitter:creator" content="@omochikaericom" />`,
      `<meta name="twitter:description" content="${description}" />`,
      `<meta name="twitter:image" content="${image}" />`,
    ];
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");

    const regexBody = /<div id="app">/;

    const bodyString = [
      '<div id="app">',
      '<h1 style="font-size: 50px;">',
      escapeHtml(title),
      "</h1>",
      '<span style="font-size: 30px;">',
      escapeHtml(ownerData.introduction),
      "</span>",
    ].join("\n");

    res.send(
      template_data
        .replace(/<meta[^>]*>/g, "")
        .replace(regexTitle, metas.join("\n"))
        .replace(regexBody, bodyString)
    );
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    res.send(template_data);
  }
};
const getShopOwner = async (uid) => {
  const owner = await db.doc(`/admins/${uid}`).get();
  if (owner && owner.exists) {
    return owner.data();
  }
  return { hidePrivacy: false };
};

const getOwnerData = async (uid) => {
  const owner = await db.doc(`/owners/${uid}`).get();
  if (owner && owner.exists) {
    return owner.data();
  }
  return { hidePrivacy: false };
};

export const stripe_parser = async (req, res) => {
  const stripe = utils.get_stripe();
  const endpointSecret = utils.getStripeWebhookSecretKey();

  const sig = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody.toString(), sig, endpointSecret);

    // const {data:{object}} = event
    if (!event) {
      return res.status(400).send(`Webhook Error: unknow error`);
    }

    if (event.type === "capability.updated") {
      await stripeLog.capability_updated(db, event);
    } else if (event.type === "account.updated") {
      await stripeLog.account_updated(db, event);
    } else if (event.type === "account.application.authorized") {
      await stripeLog.account_authorized(db, event);
    } else if (event.type === "account.application.deauthorized") {
      await stripeLog.account_deauthorized(db, event);
    } else {
      await stripeLog.unknown_log(db, event);
    }
    res.json({});
  } catch (err) {
    Sentry.captureException(err);
    res.status(400).send(`Webhook Error`);
  }
};

router.post("/stripe/callback", logger, stripe_parser);

app.use(express.json());
app.use("/1.0", router);
app.use("/api/1.0/", apis.apiRouter);
app.use("/api/2.0/", apis2.apiRouter);

app.use("/smaregi/1.0", smaregi.smaregiRouter);

app.get("/r/:restaurantName", ogpPage);
app.get("/r/:restaurantName/menus/:menuId", ogpPage);
app.get("/r/:restaurantName/order/:orderId", ogpPage);

app.get("/o/:ownerId", ownerPage);

app.get("/sitemap.xml", sitemap_response);
