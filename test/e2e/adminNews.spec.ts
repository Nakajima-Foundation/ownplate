import { test, expect } from "@playwright/test";

import newsList from "../../src/app/admin/News/data";
import { newsByYear } from "../../src/utils/newsList";

// お知らせ一覧。全部並べると新しい回が埋もれるので、直近の年だけ出して残りは畳む。
// 畳んだ分に辿り着けなくなるのがいちばん困るので、開く・閉じるを通しで動かす。
//
// 件数は data.ts から取る。リリースのたびに増えるので、数を書くと必ず古くなる。

test.setTimeout(60000);

const RECENT = newsByYear(newsList)
  .slice(0, 2)
  .reduce((count, group) => count + group.items.length, 0);

const articleLinks = "a[href^='/admin/news/']";
// 文言は言語で変わるが、年の4桁はどの言語にも入る。
const olderButton = /\d{4}/u;

test.describe("Admin news list", () => {
  test("畳んだ分を開いて、また閉じられる", async ({ page }) => {
    await page.goto("/admin/news");
    await expect(page.locator(articleLinks).first()).toBeVisible();

    await expect(page.locator(articleLinks)).toHaveCount(RECENT);
    expect(RECENT).toBeLessThan(newsList.length);

    const toggle = page.getByRole("button", { name: olderButton });
    await toggle.click();
    await expect(page.locator(articleLinks)).toHaveCount(newsList.length);

    await toggle.click();
    await expect(page.locator(articleLinks)).toHaveCount(RECENT);
  });

  test("一覧の行が、題ではなく中身を見せている", async ({ page }) => {
    await page.goto("/admin/news");
    const newest = newsList[0];
    const firstRow = page.locator(articleLinks).first();

    await expect(firstRow).toContainText(newest.summary);
    await expect(firstRow).toContainText(newest.version);
    // 「vX.Y.Z をリリースしました。」はどの回も同じなので、一覧には出さない。
    await expect(firstRow).not.toContainText(newest.title);
  });
});
