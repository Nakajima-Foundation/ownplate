// お店・メニューのページに入れる構造化データ（JSON-LD）と、JS を実行しないクローラー向けの本文。
// Firebase を触らない純粋な組み立てなので、単体テストから読める。
//
// 値はどれも店舗が入力したもの。HTML には escapeHtml を通し、JSON-LD は serializeJsonLd で
// <script> を閉じられない形にしてから出す。本文には入力から作るリンク（href / src）を置かない。
import { priceWithTax, type TaxableShop } from "../utils/commonUtils";
import { formatNational, parsePhoneNumber } from "../common/phoneutil";

// Firestore から読んだままの値。どのフィールドも、入っていない・型が違うことがある。
type Fields = Record<string, unknown>;

type Span = { start: number; end: number };
type Restaurant = {
  restaurantName: string;
  introduction: string;
  zip: string;
  state: string;
  city: string;
  streetAddress: string;
  phoneNumber: string;
  location?: { lat: number; lng: number };
  openTimes: Record<string, Span[]>;
  businessDay: Record<string, boolean>;
  tax?: TaxableShop;
};
type Menu = { itemName: string; itemDescription: string; price?: number; tax?: string };

const isFields = (value: unknown): value is Fields => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): string => (typeof value === "string" ? value : "");
const finite = (value: unknown): number | undefined => (typeof value === "number" && Number.isFinite(value) ? value : undefined);

const isSpan = (value: unknown): value is Span => isFields(value) && finite(value.start) !== undefined && finite(value.end) !== undefined;

const toTax = (data: Fields): TaxableShop | undefined => {
  if (data.inclusiveTax === true) {
    return { inclusiveTax: true };
  }
  const foodTax = finite(data.foodTax);
  const alcoholTax = finite(data.alcoholTax);
  return foodTax !== undefined && alcoholTax !== undefined ? { foodTax, alcoholTax } : undefined;
};

const toLocation = (value: unknown): Restaurant["location"] => {
  if (!isFields(value)) {
    return undefined;
  }
  const lat = finite(value.lat);
  const lng = finite(value.lng);
  return lat !== undefined && lng !== undefined ? { lat, lng } : undefined;
};

const toOpenTimes = (value: unknown): Record<string, Span[]> =>
  isFields(value) ? Object.fromEntries(Object.entries(value).map(([key, spans]) => [key, Array.isArray(spans) ? spans.filter(isSpan) : []])) : {};

const toBusinessDay = (value: unknown): Record<string, boolean> => (isFields(value) ? Object.fromEntries(Object.entries(value).map(([key, open]) => [key, open === true])) : {});

export const toRestaurant = (data: Fields): Restaurant => ({
  restaurantName: text(data.restaurantName),
  introduction: text(data.introduction),
  zip: text(data.zip),
  state: text(data.state),
  city: text(data.city),
  streetAddress: text(data.streetAddress),
  phoneNumber: text(data.phoneNumber),
  location: toLocation(data.location),
  openTimes: toOpenTimes(data.openTimes),
  businessDay: toBusinessDay(data.businessDay),
  tax: toTax(data),
});

export const toMenu = (data: Fields): Menu => ({
  itemName: text(data.itemName),
  itemDescription: text(data.itemDescription),
  price: finite(data.price),
  tax: typeof data.tax === "string" ? data.tax : undefined,
});

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
// 店の営業日の鍵（"1" が月曜 … "7" が日曜）。schema.org の曜日名と、本文に出す曜日。
const WEEKDAYS: { key: string; schema: string; label: string }[] = [
  { key: "1", schema: "Monday", label: "月" },
  { key: "2", schema: "Tuesday", label: "火" },
  { key: "3", schema: "Wednesday", label: "水" },
  { key: "4", schema: "Thursday", label: "木" },
  { key: "5", schema: "Friday", label: "金" },
  { key: "6", schema: "Saturday", label: "土" },
  { key: "7", schema: "Sunday", label: "日" },
];

export const escapeHtml = (str: unknown): string => {
  if (typeof str !== "string") {
    return "";
  }
  const mapping: Record<string, string> = {
    "&": "&amp;",
    "'": "&#x27;",
    "`": "&#x60;",
    '"': "&quot;",
    "<": "&lt;",
    ">": "&gt;",
  };
  return str.replace(/[&'`"<>]/g, (match) => mapping[match]);
};

// JSON を <script type="application/ld+json"> に入れても、`</script>` や `<!--` で抜けられない形にする。
// JSON の文字列の中では \uXXXX は同じ文字として読まれるので、中身は変わらない。
export const serializeJsonLd = (data: object): string => JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0"));

const nonEmpty = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";

// 0 時からの分を HH:MM に。日をまたぐ閉店（24:00 以上）は、その日の終わりとして 23:59 にする。
const hhmm = (minutes: number): string => {
  const clamped = Math.min(minutes, MINUTES_PER_DAY - 1);
  const hours = Math.floor(clamped / MINUTES_PER_HOUR);
  return `${String(hours).padStart(2, "0")}:${String(clamped % MINUTES_PER_HOUR).padStart(2, "0")}`;
};

// 営業する曜日ごとの、営業時間の枠。
export const openingSpans = (restaurant: Pick<Restaurant, "openTimes" | "businessDay">) =>
  WEEKDAYS.filter((day) => restaurant.businessDay[day.key]).map((day) => ({
    day,
    spans: (restaurant.openTimes[day.key] || []).filter((span) => span.start < span.end),
  }));

const nationalPhone = (phoneNumber: string): string => {
  try {
    return formatNational(parsePhoneNumber(phoneNumber));
  } catch {
    return phoneNumber;
  }
};

// 税の設定か値段が欠けていたら、値段は出さない。
const taxIncludedPrice = (restaurant: Restaurant, menu: Menu): number | undefined =>
  restaurant.tax && menu.price !== undefined ? priceWithTax(restaurant.tax, { price: menu.price, tax: menu.tax }) : undefined;

const optional = <K extends string, V>(key: K, value: V | undefined) => (value === undefined ? {} : { [key]: value });

const offerOf = (restaurant: Restaurant, menu: Menu) => {
  const price = taxIncludedPrice(restaurant, menu);
  return price === undefined ? undefined : { "@type": "Offer", price, priceCurrency: "JPY" };
};

export const restaurantJsonLd = (params: { restaurant: Restaurant; menus: Menu[]; url: string; image?: string }) => {
  const { restaurant, menus, url, image } = params;
  const hasAddress = [restaurant.zip, restaurant.state, restaurant.city, restaurant.streetAddress].some(nonEmpty);
  const hours = openingSpans(restaurant).flatMap(({ day, spans }) =>
    spans.map((span) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: day.schema, opens: hhmm(span.start), closes: hhmm(span.end) })),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.restaurantName,
    url,
    ...(nonEmpty(restaurant.introduction) ? { description: restaurant.introduction } : {}),
    ...(nonEmpty(image) ? { image } : {}),
    ...(nonEmpty(restaurant.phoneNumber) ? { telephone: restaurant.phoneNumber } : {}),
    ...(hasAddress
      ? {
          address: {
            "@type": "PostalAddress",
            ...(nonEmpty(restaurant.zip) ? { postalCode: restaurant.zip } : {}),
            ...(nonEmpty(restaurant.state) ? { addressRegion: restaurant.state } : {}),
            ...(nonEmpty(restaurant.city) ? { addressLocality: restaurant.city } : {}),
            ...(nonEmpty(restaurant.streetAddress) ? { streetAddress: restaurant.streetAddress } : {}),
            addressCountry: "JP",
          },
        }
      : {}),
    ...(restaurant.location ? { geo: { "@type": "GeoCoordinates", latitude: restaurant.location.lat, longitude: restaurant.location.lng } } : {}),
    ...(hours.length > 0 ? { openingHoursSpecification: hours } : {}),
    ...(menus.length > 0
      ? {
          hasMenu: {
            "@type": "Menu",
            hasMenuItem: menus.map((menu) => ({
              "@type": "MenuItem",
              name: menu.itemName,
              ...(nonEmpty(menu.itemDescription) ? { description: menu.itemDescription } : {}),
              ...optional("offers", offerOf(restaurant, menu)),
            })),
          },
        }
      : {}),
  };
};

export const menuItemJsonLd = (params: { restaurant: Restaurant; menu: Menu; url: string; restaurantUrl: string; image?: string }) => {
  const { restaurant, menu, url, restaurantUrl, image } = params;
  const offer = offerOf(restaurant, menu);
  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: menu.itemName,
    url,
    ...(nonEmpty(menu.itemDescription) ? { description: menu.itemDescription } : {}),
    ...(nonEmpty(image) ? { image } : {}),
    ...optional("offers", offer === undefined ? undefined : { ...offer, offeredBy: { "@type": "Restaurant", name: restaurant.restaurantName, url: restaurantUrl } }),
  };
};

const paragraph = (text: string) => `<p>${escapeHtml(text)}</p>`;
const yen = (restaurant: Restaurant, menu: Menu): string => {
  const price = taxIncludedPrice(restaurant, menu);
  return price === undefined ? "" : `${price.toLocaleString("ja-JP")}円（税込）`;
};

// JS を実行しないクローラー向けの本文。アプリが読み込まれると #app は描き直される。
export const restaurantBodyHtml = (params: { title: string; restaurant: Restaurant; menus: Menu[] }): string => {
  const { title, restaurant, menus } = params;
  const address = [nonEmpty(restaurant.zip) ? `〒${restaurant.zip}` : "", restaurant.state, restaurant.city, restaurant.streetAddress].filter(nonEmpty).join(" ");
  const hours = openingSpans(restaurant)
    .filter(({ spans }) => spans.length > 0)
    .map(({ day, spans }) => `<li>${escapeHtml(day.label)}: ${spans.map((span) => `${hhmm(span.start)}〜${hhmm(span.end)}`).join(", ")}</li>`);
  return [
    `<h1>${escapeHtml(title)}</h1>`,
    nonEmpty(restaurant.introduction) ? paragraph(restaurant.introduction) : "",
    nonEmpty(address) ? paragraph(`住所: ${address}`) : "",
    nonEmpty(restaurant.phoneNumber) ? paragraph(`電話: ${nationalPhone(restaurant.phoneNumber)}`) : "",
    hours.length > 0 ? ["<h2>営業時間</h2>", "<ul>", ...hours, "</ul>"].join("\n") : "",
    menus.length > 0
      ? ["<h2>メニュー</h2>", "<ul>", ...menus.map((menu) => `<li>${escapeHtml([menu.itemName, yen(restaurant, menu)].filter(nonEmpty).join(" "))}</li>`), "</ul>"].join("\n")
      : "",
  ]
    .filter((part) => part !== "")
    .join("\n");
};

export const menuBodyHtml = (params: { title: string; restaurant: Restaurant; menu: Menu }): string => {
  const { title, restaurant, menu } = params;
  return [
    `<h1>${escapeHtml(title)}</h1>`,
    nonEmpty(menu.itemDescription) ? paragraph(menu.itemDescription) : "",
    nonEmpty(yen(restaurant, menu)) ? paragraph(yen(restaurant, menu)) : "",
    paragraph(`お店: ${restaurant.restaurantName}`),
  ]
    .filter((part) => part !== "")
    .join("\n");
};

// お客様の画面（src/app/user/Restaurant/Utils.ts）と同じ条件で、見えるメニューだけを残す。
export const isPublicMenu = (menu: Fields): boolean => menu.deletedFlag === false && menu.publicFlag === true && (menu.validatedFlag === undefined || Boolean(menu.validatedFlag));

// 店の並び順（menuLists）に並べ、多すぎる店では先頭から limit 件に切る。
export const orderPublicMenus = <T extends Fields>(menus: { id: string; data: T }[], menuLists: string[], limit: number): T[] => {
  const byId = new Map(menus.filter((menu) => isPublicMenu(menu.data)).map((menu) => [menu.id, menu.data]));
  return menuLists
    .map((id) => byId.get(id))
    .filter((menu): menu is T => menu !== undefined)
    .slice(0, limit);
};
