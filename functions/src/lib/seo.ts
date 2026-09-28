// robots.txt と llms.txt の中身。Firebase を触らない純粋な組み立てなので、単体テストから読める。

// 検索や AI 検索に載せてよい公開サイト。staging（staging.ownplate.today）はここに無く、
// どのクローラーにも読ませない。
const PUBLIC_HOSTS = ["omochikaeri.com", "ownplate.today"];

export const isPublicHost = (hostName: string): boolean => PUBLIC_HOSTS.includes(hostName);

// 管理画面・スーパー管理画面・オペレーター画面・利用者のページ・注文ページは、検索に載せない。
const DISALLOWED_PATHS = ["/admin", "/s/", "/op", "/u/", "/r/*/order/"];

export const robotsTxt = (hostName: string): string => {
  if (!isPublicHost(hostName)) {
    return ["User-agent: *", "Disallow: /", ""].join("\n");
  }
  return [
    // AI 検索のクローラー（GPTBot / ClaudeBot / PerplexityBot など）も、下の * に従う。
    "User-agent: *",
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    "Allow: /",
    "",
    `Sitemap: https://${hostName}/sitemap.xml`,
    "",
  ].join("\n");
};

type LlmsSite = {
  hostName: string;
  siteName: string;
  siteDescription: string;
};

// https://llmstxt.org/ の形（見出し・引用の要約・リンクの一覧）。
export const llmsTxt = (site: LlmsSite): string => {
  const origin = `https://${site.hostName}`;
  return [
    `# ${site.siteName}`,
    "",
    `> ${site.siteDescription}`,
    "",
    "飲食店がテイクアウト（お持ち帰り）・デリバリーの注文をオンラインで受け付けるためのサービスです。",
    "お客様はアプリを入れずに、ブラウザからお店のメニューを見て注文し、受け取り時刻を選べます。",
    "",
    "## ページ",
    "",
    `- [トップ](${origin}/): サービスの紹介`,
    `- [お店を探す](${origin}/r): 掲載中のお店の一覧`,
    `- [エリアから探す](${origin}/r/area/all): 都道府県ごとのお店の一覧`,
    `- [よくある質問](${origin}/faq)`,
    `- [お知らせ](${origin}/news)`,
    "",
    "## お店のページ",
    "",
    `- お店のページは ${origin}/r/{お店のID}、メニューのページは ${origin}/r/{お店のID}/menus/{メニューのID}。`,
    `- 掲載中のお店の一覧: [sitemap.xml](${origin}/sitemap.xml)`,
    "",
    "## Optional",
    "",
    `- [利用規約](${origin}/terms/user)`,
    `- [プライバシーポリシー](${origin}/privacy)`,
    "",
  ].join("\n");
};
