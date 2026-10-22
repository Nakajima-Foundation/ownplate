import { describe, it } from "node:test";
import assert from "node:assert";

import {
  escapeHtml,
  isPublicMenu,
  menuBodyHtml,
  menuItemJsonLd,
  openingSpans,
  orderPublicMenus,
  restaurantBodyHtml,
  restaurantJsonLd,
  serializeJsonLd,
  toMenu,
  toRestaurant,
} from "../../src/lib/structuredData";

const HOSTILE = [
  "</script><script>alert(1)</script>",
  "<img src=x onerror=alert(1)>",
  "\" onload=\"alert(1)",
  "' onmouseover='alert(1)",
  "<!--",
  "]]>",
  "$& $' $` $1",
  "&lt;already&gt;",
  "\u2028\u2029",
  "`${x}`",
];

// 決まった種から作る、危ない文字を混ぜた文字列。落ちたら同じ種で再現できる。
const HOSTILE_ALPHABET = ["<", ">", "&", "\"", "'", "`", "/", "\\", "\u2028", "\u2029", "script", "=", " ", "a", "$", "!--"];
const generated = (seed: number, count: number): string[] => {
  const next = (state: number) => (state * 1103515245 + 12345) % 2147483648;
  return Array.from({ length: count }, (_, index) => {
    const pieces: string[] = [];
    const length = 1 + (index % 12);
    Array.from({ length }).reduce<number>((state) => {
      const advanced = next(state);
      pieces.push(HOSTILE_ALPHABET[advanced % HOSTILE_ALPHABET.length]);
      return advanced;
    }, seed + index);
    return pieces.join("");
  });
};
const SEED = 20260929;
const INPUTS = [...HOSTILE, ...generated(SEED, 300)];

const baseRestaurant = {
  restaurantName: "テスト食堂",
  introduction: "おいしいお店",
  zip: "150-0001",
  state: "東京都",
  city: "渋谷区",
  streetAddress: "神宮前1-1-1",
  phoneNumber: "+81312345678",
  location: { lat: 35.67, lng: 139.7 },
  openTimes: { "1": [{ start: 600, end: 1260 }], "2": [{ start: 600, end: 840 }, null, { start: 1020, end: 1500 }] },
  businessDay: { "1": true, "2": true, "3": false },
  inclusiveTax: false,
  foodTax: 8,
  alcoholTax: 10,
};
const baseMenu = { itemName: "からあげ弁当", itemDescription: "人気", price: 500, tax: "food" };

// 本文に出してよいタグは、組み立てる側が書いたものだけ。店の入力から来たタグは残らない。
const ALLOWED_TAGS = /<\/?(h1|h2|p|ul|li)>/g;
const assertNoInjectedMarkup = (html: string) => {
  const stripped = html.replace(ALLOWED_TAGS, "");
  assert.ok(!/[<>]/.test(stripped), `markup leaked: ${html}`);
  assert.ok(!/["'`]/.test(stripped), `quote leaked: ${html}`);
};

describe("escapeHtml", () => {
  it("escapes every character that can open markup or an attribute", () => {
    assert.strictEqual(escapeHtml("<a href=\"x\" title='y'>`&`</a>"), "&lt;a href=&quot;x&quot; title=&#x27;y&#x27;&gt;&#x60;&amp;&#x60;&lt;/a&gt;");
  });
  it("returns an empty string for non-strings", () => {
    [undefined, null, 1, {}, []].forEach((value) => assert.strictEqual(escapeHtml(value), ""));
  });
});

describe("serializeJsonLd", () => {
  it("never emits a character that can close the script element, and parses back to the same value", () => {
    INPUTS.forEach((input) => {
      const data = { name: input, nested: [{ description: input }] };
      const serialized = serializeJsonLd(data);
      assert.ok(!/[<>&\u2028\u2029]/.test(serialized), serialized);
      assert.deepStrictEqual(JSON.parse(serialized), data);
    });
  });
});

describe("toRestaurant / toMenu", () => {
  it("drops fields of the wrong type instead of passing them through", () => {
    const restaurant = toRestaurant({
      restaurantName: 1,
      phoneNumber: { toString: "x" },
      location: { lat: "35", lng: 139 },
      openTimes: { "1": "600-1200", "2": [{ start: "600", end: 900 }, { start: 600, end: 900 }] },
      businessDay: { "1": "yes", "2": true },
      inclusiveTax: "true",
      foodTax: 8,
    });
    assert.strictEqual(restaurant.restaurantName, "");
    assert.strictEqual(restaurant.phoneNumber, "");
    assert.strictEqual(restaurant.location, undefined);
    assert.deepStrictEqual(restaurant.openTimes, { "1": [], "2": [{ start: 600, end: 900 }] });
    assert.deepStrictEqual(restaurant.businessDay, { "1": false, "2": true });
    assert.strictEqual(restaurant.tax, undefined);
    assert.deepStrictEqual(toMenu({ itemName: ["x"], price: "500", tax: 1 }), { itemName: "", itemDescription: "", price: undefined, tax: undefined });
  });
  it("handles an empty document", () => {
    assert.doesNotThrow(() => restaurantBodyHtml({ title: "t", restaurant: toRestaurant({}), menus: [toMenu({})] }));
    assert.doesNotThrow(() => serializeJsonLd(restaurantJsonLd({ restaurant: toRestaurant({}), menus: [toMenu({})], url: "https://example.com/r/x" })));
  });
});

describe("restaurantJsonLd", () => {
  const restaurant = toRestaurant(baseRestaurant);
  const jsonLd = restaurantJsonLd({ restaurant, menus: [toMenu(baseMenu)], url: "https://omochikaeri.com/r/abc", image: "https://example.com/a.jpg" });

  it("describes the restaurant with address, geo and hours", () => {
    assert.strictEqual(jsonLd["@type"], "Restaurant");
    assert.strictEqual(jsonLd.name, "テスト食堂");
    assert.deepStrictEqual(jsonLd.address, {
      "@type": "PostalAddress",
      postalCode: "150-0001",
      addressRegion: "東京都",
      addressLocality: "渋谷区",
      streetAddress: "神宮前1-1-1",
      addressCountry: "JP",
    });
    assert.deepStrictEqual(jsonLd.geo, { "@type": "GeoCoordinates", latitude: 35.67, longitude: 139.7 });
    assert.deepStrictEqual(jsonLd.openingHoursSpecification, [
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "10:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "10:00", closes: "14:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "17:00", closes: "23:59" },
    ]);
  });
  it("prices menu items with tax, rounded", () => {
    assert.deepStrictEqual(jsonLd.hasMenu?.hasMenuItem, [
      { "@type": "MenuItem", name: "からあげ弁当", description: "人気", offers: { "@type": "Offer", price: 540, priceCurrency: "JPY" } },
    ]);
    const alcohol = restaurantJsonLd({ restaurant, menus: [toMenu({ ...baseMenu, price: 333, tax: "alcohol" })], url: "u" });
    assert.strictEqual(alcohol.hasMenu?.hasMenuItem[0].offers?.price, 366);
    const inclusive = restaurantJsonLd({ restaurant: toRestaurant({ ...baseRestaurant, inclusiveTax: true }), menus: [toMenu(baseMenu)], url: "u" });
    assert.strictEqual(inclusive.hasMenu?.hasMenuItem[0].offers?.price, 500);
  });
  it("omits the offer when the price or the tax setting is missing", () => {
    const noTax = restaurantJsonLd({ restaurant: toRestaurant({ ...baseRestaurant, foodTax: undefined }), menus: [toMenu(baseMenu)], url: "u" });
    assert.strictEqual(noTax.hasMenu?.hasMenuItem[0].offers, undefined);
    const noPrice = restaurantJsonLd({ restaurant, menus: [toMenu({ ...baseMenu, price: undefined })], url: "u" });
    assert.strictEqual(noPrice.hasMenu?.hasMenuItem[0].offers, undefined);
  });
  it("omits empty optional fields", () => {
    const bare = restaurantJsonLd({ restaurant: toRestaurant({ restaurantName: "x" }), menus: [], url: "u" });
    assert.deepStrictEqual(bare, { "@context": "https://schema.org", "@type": "Restaurant", name: "x", url: "u" });
  });
});

describe("openingSpans", () => {
  it("lists only business days, in weekday order, dropping empty or reversed spans", () => {
    const spans = openingSpans(toRestaurant({ businessDay: { "7": true, "1": true }, openTimes: { "7": [{ start: 900, end: 600 }], "1": [{ start: 0, end: 60 }] } }));
    assert.deepStrictEqual(
      spans.map(({ day, spans }) => [day.schema, spans]),
      [
        ["Monday", [{ start: 0, end: 60 }]],
        ["Sunday", []],
      ],
    );
  });
});

describe("menuItemJsonLd", () => {
  it("links the item to its restaurant", () => {
    const jsonLd = menuItemJsonLd({ restaurant: toRestaurant(baseRestaurant), menu: toMenu(baseMenu), url: "https://h/r/a/menus/b", restaurantUrl: "https://h/r/a" });
    assert.deepStrictEqual(jsonLd.offers, {
      "@type": "Offer",
      price: 540,
      priceCurrency: "JPY",
      offeredBy: { "@type": "Restaurant", name: "テスト食堂", url: "https://h/r/a" },
    });
  });
});

describe("body HTML", () => {
  it("renders the restaurant for crawlers without JS", () => {
    const html = restaurantBodyHtml({ title: "テスト食堂 / テイクアウト", restaurant: toRestaurant(baseRestaurant), menus: [toMenu(baseMenu)] });
    assert.ok(html.includes("<h1>テスト食堂 / テイクアウト</h1>"));
    assert.ok(html.includes("<p>住所: 〒150-0001 東京都 渋谷区 神宮前1-1-1</p>"));
    assert.ok(html.includes("<p>電話: 03-1234-5678</p>"), html);
    assert.ok(html.includes("<li>月: 10:00〜21:00</li>"));
    assert.ok(html.includes("<li>火: 10:00〜14:00, 17:00〜23:59</li>"));
    assert.ok(html.includes("<li>からあげ弁当 540円（税込）</li>"));
  });
  it("renders a menu page", () => {
    const html = menuBodyHtml({ title: "からあげ弁当 / テスト食堂", restaurant: toRestaurant(baseRestaurant), menu: toMenu(baseMenu) });
    assert.strictEqual(html, ["<h1>からあげ弁当 / テスト食堂</h1>", "<p>人気</p>", "<p>540円（税込）</p>", "<p>お店: テスト食堂</p>"].join("\n"));
  });
  it("never lets shop input become markup, in any field", () => {
    const textFields = ["restaurantName", "introduction", "zip", "state", "city", "streetAddress", "phoneNumber"];
    INPUTS.forEach((input) => {
      const restaurant = toRestaurant({ ...baseRestaurant, ...Object.fromEntries(textFields.map((field) => [field, input])) });
      const menu = toMenu({ ...baseMenu, itemName: input, itemDescription: input, tax: input });
      assertNoInjectedMarkup(restaurantBodyHtml({ title: input, restaurant, menus: [menu] }));
      assertNoInjectedMarkup(menuBodyHtml({ title: input, restaurant, menu }));
    });
  });
});

describe("isPublicMenu / orderPublicMenus", () => {
  it("keeps the same menus the customer page shows", () => {
    assert.strictEqual(isPublicMenu({ deletedFlag: false, publicFlag: true }), true);
    assert.strictEqual(isPublicMenu({ deletedFlag: false, publicFlag: true, validatedFlag: true }), true);
    assert.strictEqual(isPublicMenu({ deletedFlag: false, publicFlag: true, validatedFlag: false }), false);
    assert.strictEqual(isPublicMenu({ deletedFlag: true, publicFlag: true }), false);
    assert.strictEqual(isPublicMenu({ deletedFlag: false, publicFlag: false }), false);
    assert.strictEqual(isPublicMenu({ publicFlag: true }), false);
  });
  it("orders by menuLists, skips titles and hidden menus, and caps the count", () => {
    const visible = { deletedFlag: false, publicFlag: true };
    const menus = [
      { id: "a", data: { ...visible, itemName: "A" } },
      { id: "b", data: { ...visible, itemName: "B" } },
      { id: "c", data: { ...visible, itemName: "C", validatedFlag: false } },
      { id: "d", data: { ...visible, itemName: "D" } },
    ];
    const names = (limit: number) => orderPublicMenus(menus, ["title1", "d", "c", "b", "missing", "a"], limit).map((menu) => menu.itemName);
    assert.deepStrictEqual(names(10), ["D", "B", "A"]);
    assert.deepStrictEqual(names(2), ["D", "B"]);
  });
});
