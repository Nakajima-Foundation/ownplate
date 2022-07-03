import { ownPlateConfig, gtmID } from "@/config/project";

const hostName = ownPlateConfig.hostName;

const link = [
  {
    rel: "icon",
    type: "image/x-icon",
    href: "/favicon.ico",
  },
  {
    rel: "icon",
    sizes: "16x16",
    type: "image/x-icon",
    href: "/favicon-16x16.png",
  },
  {
    rel: "icon",
    sizes: "32x32",
    type: "image/x-icon",
    href: "/favicon-32x32.png",
  },
  {
    rel: "apple-touch-icon",
    href: "/apple-touch-icon.png",
  },
  {
    rel: "icon",
    sizes: "192x192",
    type: "image/png",
    href: "/android-chrome-192x192.png",
  },
  {
    rel: "icon",
    sizes: "512x512",
    type: "image/png",
    href: "/android-chrome-512x512.png",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.materialdesignicons.com/2.5.94/css/materialdesignicons.min.css",
  },
  {
    rel: "stylesheet",
    href: "https://use.fontawesome.com/releases/v5.2.0/css/all.css",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/icon?family=Material+Icons",
  },
];

const gtmHeadTag = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmID}');`;

const gtmBodyTag = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;

const script = [
  { src: "https://js.stripe.com/v3/" },
  {
    hid: "gtmHead",
    innerHTML: gtmHeadTag,
  },
];

const noscript = [
  {
    hid: "gtmBody",
    innerHTML: gtmBodyTag,
    pbody: true,
  },
];

const gtags = {
  gtmHead: ["innerHTML"],
  gtmBody: ["innerHTML"],
};

export const RestaurantHeader = {
  title: ownPlateConfig.siteName || process.env.npm_package_name,
  script,
  noscript,
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { hid: "description" },
    { hid: "og:image" },
    { name: "google", content: "notranslate" },
  ],
  link,
  __dangerouslyDisableSanitizersByTagID: gtags,
};

export const defaultHeader = {
  title: ownPlateConfig.siteName || process.env.npm_package_name,
  htmlAttrs: {
    lang: "ja",
  },
  script,
  noscript,
  meta: [
    {
      hid: "og:image",
      property: "og:image",
      content:
        "https://" +
        hostName +
        "/" +
        (ownPlateConfig.region === "JP"
          ? "PR-Feature.png"
          : "OGP-Facebook.png"),
    },
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      hid: "description",
      name: "description",
      content:
        ownPlateConfig.siteDescription ||
        process.env.npm_package_description ||
        "",
    },
  ],
  link,
  __dangerouslyDisableSanitizersByTagID: gtags,
};
