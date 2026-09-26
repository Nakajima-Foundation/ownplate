import { expect, type Page } from "@playwright/test";

import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import {
  SEED_CUSTOMER_PHONE_INPUT,
  SEED_OWNER_EMAIL,
  SEED_OWNER_PASSWORD,
  SEED_OWNER_UID,
  SEED_RESTAURANT_ID,
} from "../../scripts/seedData";

// 注文も管理も、まず署名を通さないと先へ進めない。エミュレーターは SMS を送らず
// 確認コードを API で返すので、本物の電話なしで通せる。
//
// **各段階が出てから次を押す。** まとめて押すと、まだ手が付いていない画面を叩いて
// 静かに進まなくなる（待ち時間を足しても直らない）。

// 種まきと同じ番号でなければ、署名して付く uid が種まきの uid と別になる。
// そうなると Stripe の顧客 id が無い扱いになり、注文が本物の Stripe を叩く。
export const PHONE_NUMBER = SEED_CUSTOMER_PHONE_INPUT;
export const CUSTOMER_NAME = "試験 太郎";

const VERIFICATION_CODES_URL = `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}/emulator/v1/projects/ownplate-dev/verificationCodes`;
const CODE_WAIT_MS = 15_000;
const CODE_POLL_MS = 250;

const verificationCodes = async (): Promise<{ code: string }[]> => {
  const response = await fetch(VERIFICATION_CODES_URL);
  const body = (await response.json()) as {
    verificationCodes: { code: string }[];
  };
  return body.verificationCodes;
};

// 確認コードはすぐには届かない。増えるまで見に行く。
const waitForNewVerificationCode = async (seen: number): Promise<string> => {
  const deadline = Date.now() + CODE_WAIT_MS;
  for (;;) {
    const codes = await verificationCodes();
    if (codes.length > seen) {
      return codes[codes.length - 1].code;
    }
    if (Date.now() > deadline) {
      throw new Error("エミュレーターに確認コードが増えませんでした");
    }
    await new Promise((resolve) => setTimeout(resolve, CODE_POLL_MS));
  }
};

export const signInByPhone = async (page: Page) => {
  const before = (await verificationCodes()).length;
  await page.locator('input[type="tel"]').fill(PHONE_NUMBER);
  await page.getByRole("button", { name: "Send SMS" }).click();

  const codeField = page.getByPlaceholder(
    "Please type the code you've received",
  );
  await expect(codeField).toBeVisible();
  await codeField.fill(await waitForNewVerificationCode(before));

  const nameField = page.locator('input[placeholder="John Smith"]');
  await expect(nameField).toBeVisible();
  await nameField.fill(CUSTOMER_NAME);
  await page.getByRole("button", { name: "Send", exact: true }).click();
};

// かごに入れて「Checkout」まで。そのあと何が出るかは署名済みかで変わるので、
// ここでは主張しない。
export const addOneItemAndCheckout = async (page: Page) => {
  await page.goto(`/r/${SEED_RESTAURANT_ID}`);
  await page.getByText("Add", { exact: true }).first().click();
  await expect(page.getByText(/Subtotal:/).first()).toBeVisible();

  await page.getByText("Confirm Cart").click();
  await expect(page.getByText("Checkout")).toBeVisible();

  await page.getByText("Checkout").click();
};

// 先にマイページで署名しておく。
//
// **お会計の途中で署名すると間欠的に進まなくなる。** ダイアログを閉じた時点で
// 利用者情報がまだ届いていないと、画面は watch 頼みの待ちに入る（RestaurantPage の
// handleDismissed / waitForUser）。先に署名しておけばその筋を通らない。
export const signInCustomer = async (page: Page) => {
  await page.goto("/u/profile");
  // 一つの試験で二度呼ぶことがある（注文を続けて出すとき）。署名済みなら
  // 「テイクアウトのお客様」の口は無く、待っても現れない。
  const signedIn = page.getByText("Sign Out");
  const signInLink = page.getByText("Sign In as a User").first();
  await expect(signInLink.or(signedIn).first()).toBeVisible();
  if (await signedIn.isVisible()) {
    return;
  }
  await signInLink.click();
  await expect(page.locator('input[type="tel"]')).toBeVisible();
  await signInByPhone(page);
  await expect(page.getByText("Sign Out")).toBeVisible();
};

// 署名のあと、注文が作られて注文確認へ移るまで待つ。
// waitForURL は「読み込み」を待つので、画面の中だけで移る SPA では返ってこない
// ことがある。URL を見に行く toHaveURL を使う。
const ORDER_URL_WAIT_MS = 90_000;

export const waitForOrderConfirmation = async (page: Page) => {
  await expect(page).toHaveURL(new RegExp(`/r/${SEED_RESTAURANT_ID}/order/`), {
    timeout: ORDER_URL_WAIT_MS,
  });
  await expect(
    page.getByRole("button", { name: /Place Order/i }).first(),
  ).toBeVisible();
};

// 確定したかどうかは「Order Placed」で見分けられない。**確定前の注意書きにも
// その文字列が入っている**（「before the order state is Order Placed」）。
// 確定後にだけ出るもので見る。
export const expectOrderPlaced = async (page: Page) => {
  await expect(page.getByText(/hasn't been placed yet/)).toHaveCount(0);
  await expect(page.getByText(/^#\d+$/).first()).toBeVisible();
};

// 注文を最後まで通し、店舗側で見分けるための注文番号（#001 の 001）を返す。
export const placeOrder = async (page: Page): Promise<string> => {
  await signInCustomer(page);
  await addOneItemAndCheckout(page);
  await waitForOrderConfirmation(page);
  await page
    .getByRole("button", { name: /Place Order/i })
    .first()
    .click();
  await expectOrderPlaced(page);

  const shown = await page
    .getByText(/^#\d+$/)
    .first()
    .textContent();
  const number = shown?.match(/#(\d+)/)?.[1];
  if (!number) {
    throw new Error("注文番号が画面に出ていません");
  }
  return number;
};

// 合言葉を変えて失敗の側も試すので、入力と着地の確認を分けてある。
export const submitOwnerSignIn = async (page: Page, password: string) => {
  await page.goto("/admin/user/signin");
  await page.locator('input[type="email"]').fill(SEED_OWNER_EMAIL);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: "Next" }).click();
};

export const signInAsOwner = async (page: Page) => {
  await submitOwnerSignIn(page, SEED_OWNER_PASSWORD);
  await expect(page).toHaveURL("/admin/restaurants");
};

// 店舗の支払い設定を試験から切り替える。エミュレーターの REST は認証が要らない。
// 画面から変えると Stripe の連携画面まで巻き込むので、値だけを直に置く。
const PAYMENT_DOC_URL =
  `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}` +
  `/v1/projects/ownplate-dev/databases/(default)/documents` +
  `/admins/${SEED_OWNER_UID}/public/payment`;

export const setInStorePayment = async (allowed: boolean) => {
  const response = await fetch(
    `${PAYMENT_DOC_URL}?updateMask.fieldPaths=inStore`,
    {
      method: "PATCH",
      // エミュレーターは owner を名乗る要求を管理権限として扱い、規則を通さない。
      // 画面から変えるわけではないので、ここは規則の外から置く。
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer owner",
      },
      body: JSON.stringify({ fields: { inStore: { booleanValue: allowed } } }),
    },
  );
  if (!response.ok) {
    throw new Error(`支払い設定を変えられません: ${response.status}`);
  }
};

// 店舗側で注文を開く。既定の注文一覧は日付で絞るので、全件の画面から探す。
// 状態を進めると一覧へ戻される作りなので、進めるたびにここを通る。
export const ADMIN_HISTORY_PATH = `/admin/restaurants/${SEED_RESTAURANT_ID}/history`;
export const ADMIN_ORDERS_PATH = `/admin/restaurants/${SEED_RESTAURANT_ID}/orders`;

export const openOrderDetail = async (page: Page, orderNumber: string) => {
  await page.goto(ADMIN_HISTORY_PATH);
  const card = page.getByText(`#${orderNumber}`).first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(new RegExp(`${ADMIN_ORDERS_PATH}/`));
};
