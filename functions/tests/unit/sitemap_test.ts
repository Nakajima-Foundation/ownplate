import { describe, it } from "node:test";
import assert from "node:assert";

import { MAX_SITEMAP_URLS, sitemapUrls, type SitemapSource } from "../../src/lib/sitemap";

const source: SitemapSource = {
  origin: "https://omochikaeri.com",
  prefectures: ["北海道", "青森県", "東京都"],
  listedStates: ["東京都", "東京都", "大阪府"],
  restaurants: [
    { id: "shopA", lastmod: "2026-09-01" },
    { id: "shopB", lastmod: "2026-08-01" },
  ],
  menus: [{ restaurantId: "shopA", id: "menu1", lastmod: "2026-09-02" }],
  noindexRestaurantIds: [],
};

describe("sitemapUrls", () => {
  const urls = sitemapUrls(source);

  it("lists the static pages without lastmod", () => {
    ["/", "/r", "/r/area/all", "/faq", "/news", "/terms/user", "/privacy"].forEach((path) => {
      assert.deepStrictEqual(
        urls.find((url) => url.loc === "https://omochikaeri.com" + path),
        { loc: "https://omochikaeri.com" + path },
      );
    });
  });

  it("lists an area page only for prefectures with a listed restaurant, by its index", () => {
    const areas = urls.filter((url) => /\/r\/area\/\d+$/.test(url.loc)).map((url) => url.loc);
    assert.deepStrictEqual(areas, ["https://omochikaeri.com/r/area/2"]);
  });

  it("lists restaurant and menu pages with lastmod", () => {
    assert.deepStrictEqual(
      urls.filter((url) => url.lastmod !== undefined),
      [
        { loc: "https://omochikaeri.com/r/shopA", lastmod: "2026-09-01" },
        { loc: "https://omochikaeri.com/r/shopB", lastmod: "2026-08-01" },
        { loc: "https://omochikaeri.com/r/shopA/menus/menu1", lastmod: "2026-09-02" },
      ],
    );
  });

  it("keeps static pages, areas and restaurants before menus when over the limit", () => {
    const limited = sitemapUrls(source, 9);
    assert.strictEqual(limited.length, 9);
    assert.ok(!limited.some((url) => url.loc.includes("/menus/")));
    assert.strictEqual(limited[limited.length - 1].loc, "https://omochikaeri.com/r/shopA");
  });

  it("caps at the sitemap protocol limit by default", () => {
    const many: SitemapSource = {
      ...source,
      menus: Array.from({ length: MAX_SITEMAP_URLS }, (_, index) => ({ restaurantId: "shopA", id: `m${index}`, lastmod: "2026-09-02" })),
    };
    assert.strictEqual(sitemapUrls(many).length, MAX_SITEMAP_URLS);
  });

  it("leaves out noindex restaurants and their menus", () => {
    const locs = sitemapUrls({ ...source, noindexRestaurantIds: ["shopA"] }).map((url) => url.loc);
    assert.ok(!locs.includes("https://omochikaeri.com/r/shopA"));
    assert.ok(!locs.includes("https://omochikaeri.com/r/shopA/menus/menu1"));
    assert.ok(locs.includes("https://omochikaeri.com/r/shopB"));
  });

  it("works with nothing listed", () => {
    assert.strictEqual(sitemapUrls({ origin: "https://x", prefectures: [], listedStates: [], restaurants: [], menus: [], noindexRestaurantIds: [] }).length, 7);
  });
});
