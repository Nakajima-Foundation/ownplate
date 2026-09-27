import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

import {
  SEED_CUSTOMER_UID,
  SEED_RESTAURANT_ID,
  SEED_RESTAURANT_NAME,
  SEED_SUPER_EMAIL,
  SEED_SUPER_PASSWORD,
} from "../../scripts/seedData";
import {
  ADMIN_HISTORY_PATH,
  ADMIN_ORDERS_PATH,
  placeOrder,
  signInAsOwner,
  submitOwnerSignIn,
} from "./helpers";

// 注文の日時は Firestore の Timestamp のまま画面へ渡る。Date のつもりで書式に
// 通すと、落ちずに「Invalid date」と出る。一覧と CSV を開いて、それが無いかを見る。
//
// 注文はこの一式の中で積み上がるので、**この試験が出した注文番号の行だけ**を見る。

const FLOW_TIMEOUT_MS = 300_000;
test.describe.configure({ mode: "serial", timeout: FLOW_TIMEOUT_MS });

const USER_HISTORY_PATH = `/admin/restaurants/${SEED_RESTAURANT_ID}/userhistory/${SEED_CUSTOMER_UID}`;
const ADMIN_ALL_ORDERS_PATH = "/admin/orders";
const SUPER_ALL_ORDERS_PATH = "/s/orders";

const HISTORY_EARNINGS_CSV = "Download Excel File (History Earnings)";
const HISTORY_DETAILS_CSV = "Download Excel File (History Details)";
const EARNINGS_CSV = "Download Excel File (Earnings)";

const RESTAURANT_NAME_COLUMN = "Restaurant name";
const INVALID_DATE = "Invalid date";
const CSV_DATE = /^\d{4}\/\d{2}\/\d{2}/;

// 画面に注文のカードが出て、どこにも Invalid date が無いこと。
const expectOrderCard = async (page: Page, orderNumber: string) => {
  await expect(page.getByText(`#${orderNumber}`).first()).toBeVisible();
  await expect(page.getByText(INVALID_DATE)).toHaveCount(0);
};

const downloadCsv = async (page: Page, label: string): Promise<string[][]> => {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByText(label).first().click(),
  ]);
  const text = await readFile(await download.path(), "utf8");
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => line.split(","));
};

// 見出しの名前でその注文の行の値を取る。列の並びは画面ごとに違う。
// 注文番号は店ごとに振られるので、店をまたぐ CSV では店の名前でも絞る。
const cellOf = (rows: string[][], orderNumber: string, column: string) => {
  const [header, ...body] = rows;
  const row = body.find(
    (cells) =>
      cells.includes(`#${orderNumber}`) &&
      (!header.includes(RESTAURANT_NAME_COLUMN) ||
        cells.includes(SEED_RESTAURANT_NAME)),
  );
  if (!row) {
    throw new Error(`CSV に #${orderNumber} の行がありません`);
  }
  return row[header.indexOf(column)];
};

const expectCsvDates = (
  rows: string[][],
  orderNumber: string,
  columns: string[],
) => {
  expect(rows.flat()).not.toContain(INVALID_DATE);
  columns.forEach((column) => {
    expect(cellOf(rows, orderNumber, column)).toMatch(CSV_DATE);
  });
};

test.describe("管理画面とスーパー管理画面で注文の日時が読める", () => {
  let orderNumber = "";

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    orderNumber = await placeOrder(page);
    await page.close();
  });

  test("注文一覧", async ({ page }) => {
    await signInAsOwner(page);
    await page.goto(ADMIN_ORDERS_PATH);
    await expectOrderCard(page, orderNumber);
  });

  test("注文履歴と、その CSV 2種", async ({ page }) => {
    await signInAsOwner(page);
    await page.goto(ADMIN_HISTORY_PATH);
    await expectOrderCard(page, orderNumber);

    const earnings = await downloadCsv(page, HISTORY_EARNINGS_CSV);
    expectCsvDates(earnings, orderNumber, ["Time Placed"]);

    const details = await downloadCsv(page, HISTORY_DETAILS_CSV);
    expect(details.flat()).not.toContain(INVALID_DATE);
  });

  test("利用者の注文履歴", async ({ page }) => {
    await signInAsOwner(page);
    await page.goto(USER_HISTORY_PATH);
    await expectOrderCard(page, orderNumber);
  });

  test("全注文と、その CSV", async ({ page }) => {
    await signInAsOwner(page);
    await page.goto(ADMIN_ALL_ORDERS_PATH);
    await expectOrderCard(page, orderNumber);

    const rows = await downloadCsv(page, EARNINGS_CSV);
    expectCsvDates(rows, orderNumber, ["date"]);
  });

  test("スーパー管理画面の全注文と、その CSV", async ({ page }) => {
    await submitOwnerSignIn(page, SEED_SUPER_PASSWORD, SEED_SUPER_EMAIL);
    await expect(page).toHaveURL("/admin/restaurants");
    await page.goto(SUPER_ALL_ORDERS_PATH);
    await expectOrderCard(page, orderNumber);

    const rows = await downloadCsv(page, EARNINGS_CSV);
    expectCsvDates(rows, orderNumber, ["date"]);
  });
});
