import { describe, it } from "node:test";
import assert from "node:assert";

import { isPublicHost, llmsTxt, robotsTxt } from "../../src/lib/seo";

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

  it("本番は管理画面・利用者のページ・注文ページだけを拒み、sitemap を示す", () => {
    const lines = robotsTxt("omochikaeri.com").split("\n");
    assert.deepStrictEqual(
      lines.filter((line) => line.startsWith("Disallow:")),
      ["Disallow: /admin", "Disallow: /s/", "Disallow: /op", "Disallow: /u/", "Disallow: /r/*/order/"],
    );
    assert.ok(lines.includes("Allow: /"));
    assert.ok(lines.includes("Sitemap: https://omochikaeri.com/sitemap.xml"));
  });

  // /s を丸ごと拒むと /sitemap.xml まで拒むことになる。スーパー管理画面は /s/ で拒む。
  it("sitemap.xml と店舗のページを拒む行が無い", () => {
    const disallowed = robotsTxt("omochikaeri.com")
      .split("\n")
      .filter((line) => line.startsWith("Disallow:"))
      .map((line) => line.slice("Disallow: ".length));
    ["/sitemap.xml", "/r/abc", "/r/abc/menus/def", "/r/area/13", "/o/abc"].forEach((path) => {
      assert.ok(
        disallowed.every((rule) => !path.startsWith(rule.replace("*", ""))),
        path,
      );
    });
  });
});

describe("llmsTxt", () => {
  const site = {
    hostName: "omochikaeri.com",
    siteName: "おもちかえり.com",
    siteDescription: "テイクアウトの注文サービス",
  };

  it("見出し・要約・リンクの形で書く", () => {
    const text = llmsTxt(site);
    assert.ok(text.startsWith("# おもちかえり.com\n\n> テイクアウトの注文サービス\n"));
    assert.ok(text.includes("(https://omochikaeri.com/r)"));
    assert.ok(text.includes("(https://omochikaeri.com/sitemap.xml)"));
  });

  it("ホスト名からリンクを作る", () => {
    assert.ok(!llmsTxt({ ...site, hostName: "ownplate.today" }).includes("omochikaeri.com/"));
  });
});
