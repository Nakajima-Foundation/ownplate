import { expect, test, type Page } from "@playwright/test";

import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import {
  SEED_EDIT_MENU_ID,
  SEED_EDIT_MENU_PRICE,
  SEED_EDIT_OWNER_EMAIL,
  SEED_EDIT_OWNER_PASSWORD,
  SEED_EDIT_RESTAURANT_ID,
} from "../../scripts/seedData";

// omochikaeri-docs#228。値段は数でなければ書けない。
//
// **守りは規則の側にある。** 画面の type="number" も、画面の検査も、REST から
// 直に書けば迂回できる。だから両方を見る——規則が弾くことと、画面が知らせること。

const ADMIN_TOP = "/admin/restaurants";
const ITEM_PATH = `/admin/restaurants/${SEED_EDIT_RESTAURANT_ID}/menus/${SEED_EDIT_MENU_ID}`;
const MENU_URL =
  `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}` +
  `/v1/projects/ownplate-dev/databases/(default)/documents` +
  `/restaurants/${SEED_EDIT_RESTAURANT_ID}/menus/${SEED_EDIT_MENU_ID}`;
const PRICE_ERROR = "Please enter a whole number of 0 or more for the price";
const FLOW_TIMEOUT_MS = 180_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

// 署名した客として書く。owner を名乗る要求は規則を通らないので、守りを試せない。
const writePriceAsOwner = async (value: unknown) => {
  const signIn = await fetch(
    `http://${EMULATOR_HOST}:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=e2e`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: SEED_EDIT_OWNER_EMAIL,
        password: SEED_EDIT_OWNER_PASSWORD,
        returnSecureToken: true,
      }),
    },
  );
  const { idToken } = (await signIn.json()) as { idToken: string };
  const response = await fetch(`${MENU_URL}?updateMask.fieldPaths=price`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields: { price: value } }),
  });
  return response.status;
};

const openItem = async (page: Page) => {
  await page.goto("/admin/user/signin");
  await page.locator('input[type="email"]').fill(SEED_EDIT_OWNER_EMAIL);
  await page.locator('input[type="password"]').fill(SEED_EDIT_OWNER_PASSWORD);
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(ADMIN_TOP);
  await page.goto(ITEM_PATH);
  const price = page.locator('input[type="number"]').first();
  await expect(price).toBeVisible();
  return price;
};

test.describe("商品の値段", () => {
  test("数でない値段はサーバが弾く", async () => {
    expect(await writePriceAsOwner({ stringValue: "abc" })).not.toBe(200);
    // 数なら通ること。弾く側だけ見ると、全部弾いていても気づけない。
    expect(
      await writePriceAsOwner({ integerValue: String(SEED_EDIT_MENU_PRICE) }),
    ).toBe(200);
  });

  test("小数と負の数は画面が知らせる", async ({ page }) => {
    const price = await openItem(page);
    const save = page.getByRole("button", { name: "Save" }).first();

    await price.fill("1.5");
    await expect(page.getByText(PRICE_ERROR)).toBeVisible();

    await price.fill("-100");
    await expect(page.getByText(PRICE_ERROR)).toBeVisible();

    // 整数に戻せば知らせは消える。
    await price.fill(String(SEED_EDIT_MENU_PRICE));
    await expect(page.getByText(PRICE_ERROR)).toHaveCount(0);
    await expect(save).toBeEnabled();
  });
});
