import { ownPlateConfig } from "../config/project";

const hostName = ownPlateConfig.hostName;

const link = [
  {
    rel: "icon",
    type: "image/x-icon",
    href: "/favicon.ico"
  },
  {
    rel: "icon",
    sizes: '16x16',
    type: "image/x-icon",
    href: "/favicon-16x16.png"
  },
  {
    rel: "icon",
    sizes: '32x32',
    type: "image/x-icon",
    href: "/favicon-32x32.png"
  },
  {
    rel: "apple-touch-icon",
    href: "/apple-touch-icon.png"
  },
  {
    rel: "icon",
    sizes: '192x192',
    type: "image/png",
    href: "/android-chrome-192x192.png"
  },
  {
    rel: "icon",
    sizes: '512x512',
    type: "image/png",
    href: "/android-chrome-512x512.png"
  },
  {
    rel: "stylesheet",
    href: "https://cdn.materialdesignicons.com/2.5.94/css/materialdesignicons.min.css"
  },
  {
    rel: "stylesheet",
    href: "https://use.fontawesome.com/releases/v5.2.0/css/all.css"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/icon?family=Material+Icons",
  }
];

const script = [
  { src: "https://js.stripe.com/v3/" },
];

export const RestaurantHeader = {
  title: ownPlateConfig.siteName || process.env.npm_package_name,
  script,
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { hid: "description" },
    { hid: "og:image" }
  ],
  link,
};

export const defaultHeader = {
  title: ownPlateConfig.siteName || process.env.npm_package_name,
  script,
  meta: [
    {
      hid: 'og:image', property: 'og:image', content: 'https://' + hostName + '/' +
        (ownPlateConfig.region === "JP" ? 'PR-Feature.png' : 'OGP-Facebook.png')
    },
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      hid: "description",
      name: "description",
      content: ownPlateConfig.siteDescription || process.env.npm_package_description || ""
    }
  ],
  link,
};
