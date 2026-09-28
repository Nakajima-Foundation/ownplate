import { describe, it } from "node:test";
import assert from "node:assert";
import * as fs from "fs";
import * as path from "path";

import { DISALLOWED_PATHS, isPublicHost, llmsTxt, robotsTxt } from "../../src/lib/seo";

// robots.txt の規則が path に当たるか。Google と同じく、前方一致・`*` は任意の文字列・`$` は末尾。
const escapeRegExp = (text: string) => text.replace(/[.+?^{}()|[\]\\]/g, "\\$&");
const ruleMatches = (rule: string, target: string): boolean => {
  const anchored = rule.endsWith("$");
  const body = anchored ? rule.slice(0, -1) : rule;
  const pattern = "^" + escapeRegExp(body).split("*").join(".*") + (anchored ? "$" : "");
  return new RegExp(pattern).test(target);
};
const disallowedRules = (text: string) =>
  text
    .split("\n")
    .filter((line) => line.startsWith("Disallow: "))
    .map((line) => line.slice("Disallow: ".length));
const isBlocked = (target: string) => disallowedRules(robotsTxt("omochikaeri.com")).some((rule) => ruleMatches(rule, target));

// 検索に載せてよい画面。ここにも DISALLOWED_PATHS にも無い経路は、下の試験で落ちる。
const PUBLIC_ROUTES = [
  "/",
  "/home",
  "/r",
  "/news",
  "/faq",
  "/r/area/all",
  "/r/area/:areaId",
  "/r/:restaurantId",
  "/o/:ownerUid",
  "/terms/user",
  "/terms/admin",
  "/privacy",
  "/l/:urlKey",
  "/m/ask",
  "/m/kuuya",
  "/m/note",
  "/:page(.*)",
];
// /r/:restaurantId の子（getUserPages）。
const RESTAURANT_CHILDREN = { public: ["menus/:menuId", "transactions-act"], private: ["order/:orderId", "card"] };

const sampleOf = (route: string) => route.replace(/:[A-Za-z]+(\([^)]*\))?/g, "abc");

// src/lib/router.ts の、/ から始まる経路（子の相対パスは除く）。
const topLevelRoutes = (): string[] => {
  const source = fs.readFileSync(path.join(__dirname, "../../../src/lib/router.ts"), "utf8");
  return [...new Set([...source.matchAll(/path: "(\/[^"]*)"/g)].map((match) => match[1]))];
};

describe("isPublicHost", () => {
  it("本番のサイトだけを公開として扱う", () => {
    assert.strictEqual(isPublicHost("omochikaeri.com"), true);
    assert.strictEqual(isPublicHost("ownplate.today"), true);
  });

  it("staging や知らないホストは公開しない", () => {
    assert.strictEqual(isPublicHost("staging.ownplate.today"), false);
    assert.strictEqual(isPublicHost(""), false);
    assert.strictEqual(isPublicHost("omochikaeri.com.example"), false);
  });
});

describe("robotsTxt", () => {
  it("staging はすべてのクローラーに全部を拒む", () => {
    assert.strictEqual(robotsTxt("staging.ownplate.today"), "User-agent: *\nDisallow: /\n");
  });

  it("本番は DISALLOWED_PATHS だけを拒み、sitemap を示す", () => {
    const text = robotsTxt("omochikaeri.com");
    assert.deepStrictEqual(disallowedRules(text), DISALLOWED_PATHS);
    assert.ok(text.split("\n").includes("Sitemap: https://omochikaeri.com/sitemap.xml"));
  });

  it("経路はすべて、拒むか公開かのどちらかに分けてある", () => {
    const unclassified = topLevelRoutes().filter((route) => !PUBLIC_ROUTES.includes(route) && !isBlocked(sampleOf(route)));
    assert.deepStrictEqual(unclassified, []);
  });

  it("公開の画面と sitemap.xml を拒まない", () => {
    [...PUBLIC_ROUTES.filter((route) => route !== "/:page(.*)"), ...RESTAURANT_CHILDREN.public.map((child) => `/r/:restaurantId/${child}`), "/sitemap.xml", "/llms.txt"]
      .map(sampleOf)
      .forEach((target) => assert.strictEqual(isBlocked(target), false, target));
  });

  it("管理画面・利用者のページ・注文・カード・ログインの戻り先・LIFF・プッシュの登録を拒む", () => {
    [
      "/admin",
      "/admin/user/signin",
      "/s",
      "/s/orders",
      "/op/orders",
      "/u/profile",
      "/r/favorites",
      "/callback/line",
      "/callback/abc/line",
      "/liff/abc",
      "/pushdevice/abc",
      ...RESTAURANT_CHILDREN.private.map((child) => sampleOf(`/r/:restaurantId/${child}`)),
    ].forEach((target) => assert.strictEqual(isBlocked(target), true, target));
  });
});

describe("llmsTxt", () => {
  const site = {
    hostName: "omochikaeri.com",
    siteName: "おもちかえり.com",
    siteDescription: "テイクアウトの注文サービス",
  };
  const linkHostsOf = (text: string) => [...text.matchAll(/\((https:\/\/[^)]+)\)/g)].map((match) => new URL(match[1]).host);

  it("見出し・要約・リンクの形で書く", () => {
    const text = llmsTxt(site);
    assert.ok(text.startsWith("# おもちかえり.com\n\n> テイクアウトの注文サービス\n"));
    assert.ok(text.includes("(https://omochikaeri.com/r)"));
    assert.ok(text.includes("(https://omochikaeri.com/sitemap.xml)"));
  });

  it("リンクはどれもそのサイトのホストを指す", () => {
    assert.deepStrictEqual([...new Set(linkHostsOf(llmsTxt({ ...site, hostName: "ownplate.today" })))], ["ownplate.today"]);
  });
});
