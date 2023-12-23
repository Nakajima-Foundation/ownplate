import { ownPlateConfig } from "@/config/project";

const hostName = ownPlateConfig.hostName;

const link = [
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

const gtmBodyTag = [].join("\n");

const script = [{ src: "https://js.stripe.com/v3/" }];

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

export const MoHeader = {
  title: ownPlateConfig.siteName || import.meta.env.npm_package_name,
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
        import.meta.env.npm_package_description ||
        "",
    },
  ],
  link,
  __dangerouslyDisableSanitizersByTagID: gtags,
};
