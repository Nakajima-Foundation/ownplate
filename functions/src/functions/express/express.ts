import express from "express";
import * as functions from "firebase-functions";
import { getApps, initializeApp } from "firebase-admin/app";
import { DocumentData, Firestore, QueryDocumentSnapshot, Timestamp, getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import { ownPlateConfig } from "../../common/project";

import * as Sentry from "@sentry/node";

import * as utils from "../../lib/utils";
import * as stripeLog from "../../lib/stripeLog";

import * as apis from "./apis";

import * as xmlbuilder from "xmlbuilder";

import { validateFirebaseId } from "../../lib/validator";
import { isPublicHost, llmsTxt, robotsTxt } from "../../lib/seo";
import { readInBatches } from "../../lib/readInBatches";
import { MAX_SITEMAP_URLS, sitemapUrls, type SitemapSource } from "../../lib/sitemap";
import { regionalSetting } from "../../common/constant";
import { escapeHtml, isPublicMenu, toMenu, toRestaurant, menuBodyHtml, menuItemJsonLd, orderPublicMenus, restaurantBodyHtml, restaurantJsonLd, serializeJsonLd } from "../../lib/structuredData";

import moment from "moment";

export const app = express();
export const router = express.Router();

// for test, db is not immutable
if (!getApps().some((app) => app.name === "[DEFAULT]")) {
  initializeApp();
}

let db = getFirestore();

export const updateDb = (_db: Firestore) => {
  db = _db;
  apis.updateDb(db);
};

export const logger = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  next();
};
export const hello_response = async (req: express.Request, res: express.Response) => {
  res.json({ message: "hello" });
};

const lastmod = (restaurant: { updatedAt?: Timestamp; createdAt?: Timestamp }) => {
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

// sitemap を作るときに、同時に投げる Firestore の読み込みの数。
const SITEMAP_READ_CONCURRENCY = 10;

const publicMenusOf = async (restaurantId: string) => {
  const menus = await db.collection(`restaurants/${restaurantId}/menus`).where("deletedFlag", "==", false).where("publicFlag", "==", true).get();
  return menus.docs.filter((doc) => isPublicMenu(doc.data())).map((doc) => ({ restaurantId, id: doc.id, lastmod: lastmod(doc.data()) }));
};

// オーナーが hidePrivacy にしているお店は、ページに noindex が付く（ogpPage）。
const noindexRestaurantIds = async (docs: QueryDocumentSnapshot[]) => {
  const uids = [...new Set(docs.map((doc) => doc.data().uid).filter((uid): uid is string => typeof uid === "string"))];
  const hiddenUids = new Set(await readInBatches(uids, SITEMAP_READ_CONCURRENCY, async (uid) => ((await getShopOwner(uid))?.hidePrivacy ? [uid] : [])));
  return docs.filter((doc) => hiddenUids.has(doc.data().uid)).map((doc) => doc.id);
};

export const sitemap_response = async (req: express.Request, res: express.Response) => {
  try {
    const urlset = xmlbuilder.create("urlset").att("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

    const docs = (await db.collection("restaurants").where("publicFlag", "==", true).where("deletedFlag", "==", false).orderBy("updatedAt", "desc").get()).docs;
    const noindex = await noindexRestaurantIds(docs);
    const withoutMenus: SitemapSource = {
      origin: "https://" + ownPlateConfig.hostName,
      prefectures: regionalSetting.AddressStates,
      listedStates: docs
        .filter((doc) => doc.data().onTheList === true)
        .map((doc) => doc.data().state)
        .filter((state): state is string => typeof state === "string"),
      restaurants: docs.map((doc) => ({ id: doc.id, lastmod: lastmod(doc.data()) })),
      menus: [],
      noindexRestaurantIds: noindex,
    };
    // メニューは、上限までの残りの枠が埋まったら、それ以上読まない。
    const menuSlots = MAX_SITEMAP_URLS - sitemapUrls(withoutMenus).length;
    const indexedIds = docs.map((doc) => doc.id).filter((id) => !noindex.includes(id));
    const menus = menuSlots > 0 ? await readInBatches(indexedIds, SITEMAP_READ_CONCURRENCY, publicMenusOf, (sofar) => sofar.length >= menuSlots) : [];
    const urls = sitemapUrls({ ...withoutMenus, menus });
    urls.forEach((sitemapUrl) => {
      const url = urlset.ele("url");
      url.ele("loc", sitemapUrl.loc);
      if (sitemapUrl.lastmod) {
        url.ele("lastmod", sitemapUrl.lastmod);
      }
    });

    const xml = urlset.dec("1.0", "UTF-8").end({ pretty: true });

    res.setHeader("Content-Type", "text/xml");
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.send(xml);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    return res.status(500).end();
  }
};

const getMenuData = async (restaurantName: string, menuId: string) => {
  if (menuId) {
    const menu = await db.doc(`restaurants/${restaurantName}/menus/${menuId}`).get();
    if (menu && menu.exists) {
      const menu_data = menu.data();
      if (!menu_data) {
        return { exists: false };
      }
      return {
        image: (menu_data?.images?.item?.resizedImages || {})["600"] || menu_data.itemPhoto,
        description: menu_data?.itemDescription,
        name: menu_data?.itemName,
        data: menu_data,
        exists: true,
      };
    }
  }
  return {
    exists: false,
  };
};
// Express 5 の params は wildcard ルート用に string[] も取りうる。ここは名前付き
// パラメータだけのルートなので、実際に受け取る形を型で明示する。
type OgpParams = { restaurantName: string; menuId: string };

// 構造化データに載せるメニューの上限。メニューの多い店でも、ページとデータの読み込みを抑える。
const MAX_STRUCTURED_MENUS = 100;

const defaultBody = (title: string, introduction: unknown) =>
  ["<h1 style=\"font-size: 50px;\">", escapeHtml(title), "</h1>", "<span style=\"font-size: 30px;\">", escapeHtml(introduction), "</span>"].join("\n");

const loadPublicMenus = async (restaurantName: string, menuLists: unknown) => {
  const menus = await db.collection(`restaurants/${restaurantName}/menus`).where("deletedFlag", "==", false).where("publicFlag", "==", true).get();
  const order = Array.isArray(menuLists) ? menuLists.filter((id): id is string => typeof id === "string") : [];
  return orderPublicMenus(
    menus.docs.map((doc) => ({ id: doc.id, data: doc.data() })),
    order,
    MAX_STRUCTURED_MENUS,
  );
};

// お店・メニューのページの JSON-LD と、JS を実行しないクローラー向けの本文。
const structuredPage = async (params: {
  restaurantName: string;
  restaurant: DocumentData;
  menuData: Awaited<ReturnType<typeof getMenuData>>;
  title: string;
  url: string;
  image?: string;
}) => {
  const { restaurantName, menuData, title, url, image } = params;
  const restaurant = toRestaurant(params.restaurant);
  const restaurantUrl = `https://${ownPlateConfig.hostName}/r/${restaurantName}`;
  if (menuData.exists) {
    if (!menuData.data) {
      return undefined;
    }
    const menu = toMenu(menuData.data);
    return {
      jsonLd: serializeJsonLd(menuItemJsonLd({ restaurant, menu, url, restaurantUrl, image })),
      body: menuBodyHtml({ title, restaurant, menu }),
    };
  }
  const menus = (await loadPublicMenus(restaurantName, params.restaurant.menuLists)).map(toMenu);
  return {
    jsonLd: serializeJsonLd(restaurantJsonLd({ restaurant, menus, url, image })),
    body: restaurantBodyHtml({ title, restaurant, menus }),
  };
};

// 構造化データが作れなくても、OGP のページはこれまでどおり返す。
const structuredPageOrSkip = async (params: Parameters<typeof structuredPage>[0]) => {
  try {
    return await structuredPage(params);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    return undefined;
  }
};

const ogpPage = async (req: express.Request<OgpParams>, res: express.Response): Promise<void> => {
  const { restaurantName, menuId } = req.params;
  const isOrderPage = req.path.includes("/order/");
  const template_data = fs.readFileSync("./templates/index.html", {
    encoding: "utf8",
  });
  // res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
  res.setHeader("X-Frame-Options", "deny");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Referrer-Policy", "no-referrer");
  try {
    if (!validateFirebaseId(restaurantName)) {
      res.status(404).send(template_data);
      return;
    }
    if (menuId && !validateFirebaseId(menuId)) {
      res.status(404).send(template_data);
      return;
    }
    const restaurant = await db.doc(`restaurants/${restaurantName}`).get();

    if (!restaurant || !restaurant.exists) {
      res.status(404).send(template_data);
      return;
    }
    const restaurant_data = restaurant.data();
    if (!restaurant_data || restaurant_data.deletedFlag || !restaurant_data.publicFlag) {
      res.status(404).send(template_data);
      return;
    }

    const menuData = await getMenuData(restaurantName, menuId);
    // 無いメニューと、お客様の画面に出ないメニューは 404。名前や画像も OGP に出さない。
    if (menuId && (!menuData.exists || !menuData.data || !isPublicMenu(menuData.data))) {
      res.status(404).send(template_data);
      return;
    }

    const ownerData = await getShopOwner(restaurant_data.uid);
    if (!ownerData) {
      res.status(404).send(template_data);
      return;
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
      ? `https://${ownPlateConfig.hostName}/r/${escapeHtml(restaurantName)}/menus/${escapeHtml(menuId)}`
      : `https://${ownPlateConfig.hostName}/r/${escapeHtml(restaurantName)}`;

    const metas = [
      `<title>${escapeHtml(title)}</title>`,
      "<meta data-n-head=\"1\" charset=\"utf-8\">",
      "<meta data-n-head=\"1\" name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
      `<meta name="description" content="${escapeHtml(description)}"/>`,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
      `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
      "<meta property=\"og:type\" content=\"website\" />",
      `<meta property="og:url" content="${url}" />`,
      `<link rel="canonical" href="${url}" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta property="og:image" content="${escapeHtml(image)}" />`,
      "<meta name=\"twitter:card\" content=\"summary_large_image\" />",
      "<meta name=\"twitter:site\" content=\"@omochikaericom\" />",
      "<meta name=\"twitter:creator\" content=\"@omochikaericom\" />",
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    ];
    if (ownerData.hidePrivacy) {
      metas.push("<meta name=\"robots\" content=\"noindex\" />");
    }
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");

    const regexBody = /<div id="app">/;

    const seo = ownerData.hidePrivacy || isOrderPage ? undefined : await structuredPageOrSkip({ restaurantName, restaurant: restaurant_data, menuData, title, url, image });
    if (seo) {
      metas.push(`<script type="application/ld+json">${seo.jsonLd}</script>`);
    }
    const bodyString = ["<div id=\"app\">", seo ? seo.body : defaultBody(title, restaurant_data.introduction)].join("\n");

    // 置き換える文字列は店舗の入力を含むので、$& などを置換の記法として読ませないよう関数で渡す。
    res.send(
      template_data
        .replace(/<meta[^>]*>/g, "")
        .replace(regexTitle, () => metas.join("\n"))
        .replace(regexBody, () => bodyString),
    );
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    res.send(template_data);
  }
};

type OwnerParams = { ownerId: string };

const ownerPage = async (req: express.Request<OwnerParams>, res: express.Response): Promise<void> => {
  const { ownerId } = req.params;
  const template_data = fs.readFileSync("./templates/index.html", {
    encoding: "utf8",
  });
  // res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'"), res.setHeader("X-Frame-Options", "deny");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Referrer-Policy", "no-referrer");
  try {
    if (!validateFirebaseId(ownerId)) {
      res.status(404).send(template_data);
      return;
    }
    const ownerData = await getOwnerData(ownerId);
    if (!ownerData) {
      res.send(template_data);
      return;
    }

    const siteName = ownPlateConfig.siteName;
    const title = [ownerData.name].join(" / ");
    const image = (ownerData?.images?.cover?.resizedImages || {})["600"];
    const description = ownerData.description;
    const regexTitle = /<title.*title>/;
    const url = `https://${ownPlateConfig.hostName}/o/${escapeHtml(ownerId)}`;

    const metas = [
      `<title>${escapeHtml(title)}</title>`,
      "<meta data-n-head=\"1\" charset=\"utf-8\">",
      "<meta data-n-head=\"1\" name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
      `<meta name="description" content="${escapeHtml(description)}"/>`,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
      `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
      "<meta property=\"og:type\" content=\"website\" />",
      `<meta property="og:url" content="${url}" />`,
      `<link rel="canonical" href="${url}" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta property="og:image" content="${escapeHtml(image)}" />`,
      "<meta name=\"twitter:card\" content=\"summary_large_image\" />",
      "<meta name=\"twitter:site\" content=\"@omochikaericom\" />",
      "<meta name=\"twitter:creator\" content=\"@omochikaericom\" />",
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    ];
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");

    const regexBody = /<div id="app">/;

    const bodyString = [
      "<div id=\"app\">",
      "<h1 style=\"font-size: 50px;\">",
      escapeHtml(title),
      "</h1>",
      "<span style=\"font-size: 30px;\">",
      escapeHtml(ownerData.introduction),
      "</span>",
    ].join("\n");

    res.send(
      template_data
        .replace(/<meta[^>]*>/g, "")
        .replace(regexTitle, metas.join("\n"))
        .replace(regexBody, bodyString),
    );
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    res.send(template_data);
  }
};
const getShopOwner = async (uid: string) => {
  const owner = await db.doc(`/admins/${uid}`).get();
  if (owner && owner.exists) {
    return owner.data();
  }
  return { hidePrivacy: false };
};

const getOwnerData = async (uid: string) => {
  const owner = await db.doc(`/owners/${uid}`).get();
  if (owner && owner.exists) {
    return owner.data();
  }
  return { hidePrivacy: false };
};

export const stripe_parser = async (req: express.Request & { rawBody?: Buffer }, res: express.Response) => {
  const stripe = utils.get_stripe_v2();
  const endpointSecret = utils.getStripeWebhookSecretKey();

  const sig = req.headers["stripe-signature"];
  if (!sig || !req.rawBody) {
    return res.status(400).send("Webhook Error: missing signature or body");
  }
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody.toString(), sig, endpointSecret);

    // const {data:{object}} = event
    if (!event) {
      return res.status(400).send("Webhook Error: unknow error");
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
    return res.json({});
  } catch (err) {
    Sentry.captureException(err);
    return res.status(400).send("Webhook Error");
  }
};

export const alogger = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const message = "access " + req.path;
  const { path, method, originalUrl, params, query, headers } = req;

  const ip = headers["fastly-client-ip"];
  const mobile = headers["sec-ch-ua-mobile"];
  const platform = headers["sec-ch-ua-platform"];
  const ua = headers["user-agent"];
  const country = headers["x-country-code"];
  const host = headers["x-forwarded-host"];

  const log = {
    path,
    method,
    originalUrl,
    params,
    query,
    ip,
    mobile,
    platform,
    ua,
    country,
    host,
  };
  functions.logger.log(message, log);
  next();
};

router.post("/stripe/callback", logger, stripe_parser);

app.use(express.json());
app.use(alogger);

app.use("/1.0", router); // for stripe
app.use("/api/1.0/", apis.apiRouter);

app.get("/r/:restaurantName", ogpPage);
app.get("/r/:restaurantName/menus/:menuId", ogpPage);
app.get("/r/:restaurantName/order/:orderId", ogpPage);

app.get("/o/:ownerId", ownerPage);

app.get("/sitemap.xml", sitemap_response);

const TEXT_CACHE_CONTROL = "public, max-age=3600, s-maxage=3600";

app.get("/robots.txt", (req: express.Request, res: express.Response) => {
  res.set("Cache-Control", TEXT_CACHE_CONTROL);
  res.type("text/plain").send(robotsTxt(ownPlateConfig.hostName));
});

app.get("/llms.txt", (req: express.Request, res: express.Response) => {
  if (!isPublicHost(ownPlateConfig.hostName)) {
    res.status(404).end();
    return;
  }
  res.set("Cache-Control", TEXT_CACHE_CONTROL);
  res.type("text/plain").send(llmsTxt(ownPlateConfig));
});
