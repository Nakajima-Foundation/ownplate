// sitemap.xml に載せる URL の一覧。Firebase を触らない純粋な組み立てなので、単体テストから読める。

// 1 つの sitemap に載せてよい URL の上限（sitemaps.org の決まり）。
export const MAX_SITEMAP_URLS = 50000;

// 誰でも見られる、お店に依らないページ。
const STATIC_PATHS = ["/", "/r", "/r/area/all", "/faq", "/news", "/terms/user", "/privacy"];

export type SitemapUrl = { loc: string; lastmod?: string };

export type SitemapSource = {
  origin: string;
  // 都道府県の一覧（画面の /r/area/:areaId は、この並びの添字で県を指す）
  prefectures: string[];
  // 一覧に載せているお店の都道府県（エリアのページに 1 軒でもあれば載せる）
  listedStates: string[];
  restaurants: { id: string; lastmod: string }[];
  menus: { restaurantId: string; id: string; lastmod: string }[];
  // ページに noindex を付けているお店（オーナーの hidePrivacy）。お店もメニューも載せない。
  noindexRestaurantIds: string[];
};

const areaPaths = (prefectures: string[], listedStates: string[]): string[] => {
  const listed = new Set(listedStates);
  return prefectures.flatMap((prefecture, index) => (listed.has(prefecture) ? [`/r/area/${index}`] : []));
};

// 上限を超えるときは、お店に依らないページ・エリア・お店・メニューの順に残す。
export const sitemapUrls = (source: SitemapSource, limit: number = MAX_SITEMAP_URLS): SitemapUrl[] => {
  const { origin } = source;
  const noindex = new Set(source.noindexRestaurantIds);
  const restaurants = source.restaurants.filter((restaurant) => !noindex.has(restaurant.id));
  const menus = source.menus.filter((menu) => !noindex.has(menu.restaurantId));
  return [
    ...STATIC_PATHS.map((path) => ({ loc: origin + path })),
    ...areaPaths(source.prefectures, source.listedStates).map((path) => ({ loc: origin + path })),
    ...restaurants.map((restaurant) => ({ loc: `${origin}/r/${restaurant.id}`, lastmod: restaurant.lastmod })),
    ...menus.map((menu) => ({ loc: `${origin}/r/${menu.restaurantId}/menus/${menu.id}`, lastmod: menu.lastmod })),
  ].slice(0, limit);
};
