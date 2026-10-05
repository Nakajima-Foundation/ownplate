import { expect, test } from "@playwright/test";

import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import {
  SEED_EDIT_OWNER_EMAIL,
  SEED_EDIT_OWNER_PASSWORD,
  SEED_OWNER_EMAIL,
  SEED_OWNER_PASSWORD,
  SEED_RESTAURANT_ID,
  SEED_SUB_EMAIL,
  SEED_SUB_PASSWORD,
} from "../../scripts/seedData";
import { placeOrder } from "./helpers";

// 店舗の timeline を **誰が読めるか**。画面を通さず Firestore の REST を
// 本物のトークンで叩くので、firestore.rules をそのまま通ります
// （`Bearer owner` は規則を迂回してしまうので使わない）。
//
// 店舗の入れ子の規則と、串刺しの規則は役割が違う:
//   入れ子  … 経路で決まる。だから **問い合わせ** が通る。オーナーと子アカウント。
//   串刺し  … resource.data.ownerUid で決まる。オーナーだけ。
// 子アカウントは店舗ごとなので、串刺しでは見えないのが正しい。

const AUTH_BASE = `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`;
const FIRESTORE_BASE =
  `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}` +
  `/v1/projects/ownplate-dev/databases/(default)/documents`;

const idTokenFor = async (email: string, password: string) => {
  const response = await fetch(
    `${AUTH_BASE}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=e2e`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const body: { idToken?: string } = await response.json();
  if (!body.idToken) {
    throw new Error(`${email} で入れません: ${response.status}`);
  }
  return body.idToken;
};

const authHeader = (idToken: string | null): Record<string, string> =>
  idToken
    ? { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }
    : { "Content-Type": "application/json" };

// 画面がやるのと同じ形。経路で絞り、createdAt の降順。
const shopTimelineQuery = async (idToken: string | null) =>
  fetch(`${FIRESTORE_BASE}/restaurants/${SEED_RESTAURANT_ID}:runQuery`, {
    method: "POST",
    headers: authHeader(idToken),
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "messages" }],
        orderBy: [
          { field: { fieldPath: "createdAt" }, direction: "DESCENDING" },
        ],
      },
    }),
  });

// 全店舗の串刺し。子アカウントはここを引けてはいけない。
const crossShopQuery = async (idToken: string, ownerUid: string) =>
  fetch(`${FIRESTORE_BASE}:runQuery`, {
    method: "POST",
    headers: authHeader(idToken),
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
        orderBy: [
          { field: { fieldPath: "createdAt" }, direction: "DESCENDING" },
        ],
      },
    }),
  });

const rowsIn = async (response: Response) => {
  const body: { document?: unknown }[] = await response.json();
  return body.filter((entry) => entry.document !== undefined).length;
};

test("timeline を読めるのはこの店舗のオーナーと子アカウントだけ", async ({
  page,
}) => {
  // 行が無いと「読めた」と「空だった」が見分けられない。
  await placeOrder(page);

  const ownerToken = await idTokenFor(SEED_OWNER_EMAIL, SEED_OWNER_PASSWORD);
  const subToken = await idTokenFor(SEED_SUB_EMAIL, SEED_SUB_PASSWORD);
  const otherOwnerToken = await idTokenFor(
    SEED_EDIT_OWNER_EMAIL,
    SEED_EDIT_OWNER_PASSWORD,
  );

  const asOwner = await shopTimelineQuery(ownerToken);
  expect(asOwner.status).toBe(200);
  expect(await rowsIn(asOwner)).toBeGreaterThan(0);

  const asSub = await shopTimelineQuery(subToken);
  expect(asSub.status).toBe(200);
  expect(await rowsIn(asSub)).toBeGreaterThan(0);

  // 別のオーナー。親子関係も無いので、どちらの項にも当たらない。
  expect((await shopTimelineQuery(otherOwnerToken)).status).toBe(403);

  // 署名なし。
  expect((await shopTimelineQuery(null)).status).toBe(403);
});

// 読めるだけで、書けてはいけない。Firestore の規則は allow を OR するだけで
// deny が無いので、どこかに書き込みの allow を足すと黙って通ってしまう。
test("オーナーでも timeline には書けない", async ({ page }) => {
  await placeOrder(page);
  const ownerToken = await idTokenFor(SEED_OWNER_EMAIL, SEED_OWNER_PASSWORD);

  // 読めることを先に示す。403 が「経路違い」ではなく「書けない」だと分かるように。
  const asOwner = await shopTimelineQuery(ownerToken);
  expect(asOwner.status).toBe(200);
  expect(await rowsIn(asOwner)).toBeGreaterThan(0);

  const written = await fetch(
    `${FIRESTORE_BASE}/restaurants/${SEED_RESTAURANT_ID}/messages/forged` +
      `?updateMask.fieldPaths=text`,
    {
      method: "PATCH",
      headers: authHeader(ownerToken),
      body: JSON.stringify({ fields: { text: { stringValue: "偽の行" } } }),
    },
  );
  expect(written.status).toBe(403);
});

test("子アカウントは串刺しでは見えない", async ({ page }) => {
  await placeOrder(page);

  const ownerToken = await idTokenFor(SEED_OWNER_EMAIL, SEED_OWNER_PASSWORD);
  const subToken = await idTokenFor(SEED_SUB_EMAIL, SEED_SUB_PASSWORD);

  // 親オーナーは引ける。串刺しが生きていることの対照。
  const asOwner = await crossShopQuery(ownerToken, "e2eowner");
  expect(asOwner.status).toBe(200);
  expect(await rowsIn(asOwner)).toBeGreaterThan(0);

  // 子アカウントが親の uid で引こうとしても、規則は自分の uid しか許さない。
  expect((await crossShopQuery(subToken, "e2eowner")).status).toBe(403);
});
