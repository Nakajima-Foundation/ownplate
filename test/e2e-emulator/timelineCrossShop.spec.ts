import { expect, test } from "@playwright/test";

import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import {
  SEED_EDIT_OWNER_EMAIL,
  SEED_EDIT_OWNER_PASSWORD,
  SEED_EDIT_OWNER_UID,
  SEED_OWNER_EMAIL,
  SEED_OWNER_PASSWORD,
  SEED_OWNER_UID,
} from "../../scripts/seedData";
import { placeOrder } from "./helpers";

// 複数店舗のオーナーが timeline を串刺しで引けること、そして **他人の行は引けないこと**。
//
// 画面を通さず、Firestore の REST を利用者のトークンで叩く。`Bearer owner` ではなく
// 本物のトークンを使うので、**firestore.rules を実際に通ります**。collection group の
// 問い合わせは規則が「安全だと証明できる」形でないと弾かれるので、絞り込みも一緒に試す。

const SIGN_IN_URL =
  `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}` +
  `/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=e2e`;
const QUERY_URL =
  `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}` +
  `/v1/projects/ownplate-dev/databases/(default)/documents:runQuery`;

const idTokenFor = async (email: string, password: string) => {
  const response = await fetch(SIGN_IN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const body: { idToken?: string } = await response.json();
  if (!body.idToken) {
    throw new Error(`${email} で入れません: ${response.status}`);
  }
  return body.idToken;
};

// 全店舗を串刺しに引く。画面がやることと同じ形。
const crossShopQuery = async (idToken: string, ownerUid: string) =>
  fetch(QUERY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "messages", allDescendants: true }],
        where: {
          fieldFilter: {
            field: { fieldPath: "ownerUid" },
            op: "EQUAL",
            value: { stringValue: ownerUid },
          },
        },
      },
    }),
  });

test.describe.configure({ mode: "serial" });

test("オーナーは自分の全店舗の timeline を串刺しで引ける", async ({ page }) => {
  await placeOrder(page);

  const token = await idTokenFor(SEED_OWNER_EMAIL, SEED_OWNER_PASSWORD);
  const response = await crossShopQuery(token, SEED_OWNER_UID);
  expect(response.status).toBe(200);

  const rows: { document?: { fields?: Record<string, unknown> } }[] =
    await response.json();
  const found = rows.filter((row) => row.document);
  expect(found.length).toBeGreaterThan(0);
});

// ここが本題。規則が無いと、他人の店の timeline が全部読める。
test("他のオーナーの行は引けない", async ({ page: _page }) => {
  const token = await idTokenFor(
    SEED_EDIT_OWNER_EMAIL,
    SEED_EDIT_OWNER_PASSWORD,
  );

  // 自分のぶんを引くのは通る（まだ無ければ0件）
  const mine = await crossShopQuery(token, SEED_EDIT_OWNER_UID);
  expect(mine.status).toBe(200);

  // 他人のぶんを名指しで引くのは、規則が弾く
  const theirs = await crossShopQuery(token, SEED_OWNER_UID);
  expect(theirs.status).not.toBe(200);
});
