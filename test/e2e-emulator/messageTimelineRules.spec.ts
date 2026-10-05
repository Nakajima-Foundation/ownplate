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
  SEED_SUB_UNASSIGNED_EMAIL,
  SEED_SUB_UNASSIGNED_PASSWORD,
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
const FIRESTORE_V1 = `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}/v1`;
const FIRESTORE_BASE = `${FIRESTORE_V1}/projects/ownplate-dev/databases/(default)/documents`;

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

// 返ってきた行の資源名。書き換えの試験は **実在する行** に当てないと、
// 作成が拒まれただけで「更新も拒まれる」と読み違える。
const documentNamesIn = async (response: Response): Promise<string[]> => {
  const body: { document?: { name?: string } }[] = await response.json();
  return body.flatMap((entry) =>
    entry.document?.name ? [entry.document.name] : [],
  );
};

const rowsIn = async (response: Response) =>
  (await documentNamesIn(response)).length;

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

  // 同じ親の下にいるが、この店舗を担当していない子。親子関係だけでは足りず、
  // 担当店舗の一覧に入っていることまで要る。
  const unassignedToken = await idTokenFor(
    SEED_SUB_UNASSIGNED_EMAIL,
    SEED_SUB_UNASSIGNED_PASSWORD,
  );
  expect((await shopTimelineQuery(unassignedToken)).status).toBe(403);

  // 署名なし。
  expect((await shopTimelineQuery(null)).status).toBe(403);
});

// 読めるだけで、書けてはいけない。Firestore の規則は allow を OR するだけで
// deny が無いので、どこかに書き込みの allow を足すと黙って通ってしまう。
// 読める側は **誰も** 書けない。オーナーだけで測ると、子アカウントにだけ
// 書き込みを許す規則が黙って通ってしまう。
const expectCannotWrite = async (idToken: string, existingName: string) => {
  const forged = JSON.stringify({
    fields: { text: { stringValue: "偽の行" } },
  });

  // 既にある行の書き換え。
  const updated = await fetch(
    `${FIRESTORE_V1}/${existingName}?updateMask.fieldPaths=text`,
    { method: "PATCH", headers: authHeader(idToken), body: forged },
  );
  expect(updated.status).toBe(403);

  // 新しい行の作成。
  const created = await fetch(
    `${FIRESTORE_BASE}/restaurants/${SEED_RESTAURANT_ID}/messages/forged` +
      `?updateMask.fieldPaths=text`,
    { method: "PATCH", headers: authHeader(idToken), body: forged },
  );
  expect(created.status).toBe(403);

  // 行の削除。
  const deleted = await fetch(`${FIRESTORE_V1}/${existingName}`, {
    method: "DELETE",
    headers: authHeader(idToken),
  });
  expect(deleted.status).toBe(403);
};

test("読める側は誰も timeline に書けない", async ({ page }) => {
  await placeOrder(page);
  const ownerToken = await idTokenFor(SEED_OWNER_EMAIL, SEED_OWNER_PASSWORD);
  const subToken = await idTokenFor(SEED_SUB_EMAIL, SEED_SUB_PASSWORD);

  // 読めることを先に示す。403 が「経路違い」ではなく「書けない」だと分かるように。
  const asOwner = await shopTimelineQuery(ownerToken);
  expect(asOwner.status).toBe(200);
  const names = await documentNamesIn(asOwner);
  expect(names.length).toBeGreaterThan(0);

  await expectCannotWrite(ownerToken, names[0]);
  await expectCannotWrite(subToken, names[0]);
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
