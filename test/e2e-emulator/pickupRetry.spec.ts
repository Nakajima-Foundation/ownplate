import { expect, test } from "@playwright/test";

import { SEED_CLOSE_TIME } from "../../scripts/seedData";
import {
  addOneItemAndCheckout,
  expectOrderPlaced,
  signInCustomer,
  waitForOrderConfirmation,
} from "./helpers";
import { setClosingTime } from "./shopState";

// 受取時刻「深夜 0:00」（営業時間の終わりに 12:00 AM を選ぶと出る枠）で、確定が一度失敗して
// やり直したとき、同じ受取日時が送られること。以前は受取日の一覧の Date を書き換えていたので、
// やり直すと翌日を起点に計算し、受取日が1日ずれた。
//
// 店舗の営業時間を変えるので、ほかの試験と同じ店舗を触る。**必ず戻す。**

const FLOW_TIMEOUT_MS = 120_000;
const MIDNIGHT_SLOT = 24 * 60;
const MILLISECONDS_PER_SECOND = 1000;
// 受取日時は店の時刻（JST、UTC+9）で数える。試験を走らせる側のタイムゾーンでは読まない。
const TOKYO_OFFSET_MS = 9 * 60 * 60 * MILLISECONDS_PER_SECOND;

test.describe.configure({ mode: "serial", timeout: FLOW_TIMEOUT_MS });

test.afterEach(async () => {
  await setClosingTime(SEED_CLOSE_TIME);
});

type OrderPlaceRequest = { data: { timeToPickup: { seconds: number } } };

test("確定をやり直しても深夜 0:00 の受取日時がずれない", async ({ page }) => {
  await setClosingTime(MIDNIGHT_SLOT);
  await signInCustomer(page);
  await addOneItemAndCheckout(page);
  await waitForOrderConfirmation(page);

  // 受取日は一覧の最後の日にする。今日は残りの枠が時刻しだいで変わる。
  const timeSelect = page.locator("select", {
    has: page.locator(`option[value="${MIDNIGHT_SLOT}"]`),
  });
  const daySelect = timeSelect.locator("xpath=preceding-sibling::select[1]");
  const dayCount = await daySelect.locator("option").count();
  await daySelect.selectOption({ index: dayCount - 1 });
  await timeSelect.selectOption(String(MIDNIGHT_SLOT));

  // 1回目の確定は送られた受取日時を控えて失敗させ、2回目は通す。
  const sentSeconds: number[] = [];
  await page.route("**/orderPlaceJp2", async (route) => {
    const request: OrderPlaceRequest = route.request().postDataJSON();
    sentSeconds.push(request.data.timeToPickup.seconds);
    if (sentSeconds.length === 1) {
      await route.abort();
      return;
    }
    await route.continue();
  });

  const placeOrderButton = page
    .getByRole("button", { name: /Place Order/i })
    .first();
  await placeOrderButton.click();
  await page.getByText("Close", { exact: true }).click();
  await placeOrderButton.click();
  await expectOrderPlaced(page);

  expect(sentSeconds).toHaveLength(2);
  expect(sentSeconds[1]).toBe(sentSeconds[0]);
  const pickupInTokyo = new Date(
    sentSeconds[0] * MILLISECONDS_PER_SECOND + TOKYO_OFFSET_MS,
  );
  expect([pickupInTokyo.getUTCHours(), pickupInTokyo.getUTCMinutes()]).toEqual([
    0, 0,
  ]);
});
