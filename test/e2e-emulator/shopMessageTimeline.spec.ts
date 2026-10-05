import { expect, test } from "@playwright/test";

import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import { SEED_RESTAURANT_ID } from "../../scripts/seedData";
import { placeOrder } from "./helpers";

// 注文を通すと、店舗向けの timeline に1件残ることを見る。
// LINE の talk の代わりなので、**配信とは独立に書かれる**のが肝心。
// 種まきの店舗は LINE も端末登録も持っていないので、通知はどこへも届かない。
// それでも残っていれば、独立していることが示せる。

const MESSAGES_URL =
  `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}` +
  `/v1/projects/ownplate-dev/databases/(default)/documents` +
  `/restaurants/${SEED_RESTAURANT_ID}/messages`;

type FirestoreDoc = {
  name: string;
  fields: Record<string, { stringValue?: string; integerValue?: string }>;
};

const readMessages = async (): Promise<FirestoreDoc[]> => {
  const response = await fetch(`${MESSAGES_URL}?pageSize=300`, {
    headers: { Authorization: "Bearer owner" },
  });
  if (!response.ok) {
    throw new Error(`timeline を読めません: ${response.status}`);
  }
  const body: { documents?: FirestoreDoc[] } = await response.json();
  return body.documents ?? [];
};

const removeMessage = async (id: string) => {
  await fetch(`${MESSAGES_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer owner" },
  });
};

test("注文を通すと、通知が届かなくても timeline に残る", async ({ page }) => {
  const before = (await readMessages()).map((doc) => doc.name);

  const orderNumber = await placeOrder(page);

  const added = (await readMessages()).filter(
    (doc) => !before.includes(doc.name),
  );
  expect(added.length).toBe(1);

  const entry = added[0];
  const id = entry.name.split("/").pop() ?? "";
  try {
    expect(id).toContain("msg_order_placed");
    expect(entry.fields.messageId?.stringValue).toBe("msg_order_placed");
    expect(entry.fields.restaurantId?.stringValue).toBe(SEED_RESTAURANT_ID);
    // 文面は送ったそのもの。注文番号が入っている。
    expect(entry.fields.text?.stringValue).toContain(orderNumber);
    expect(entry.fields.path?.stringValue).toContain(
      `/admin/restaurants/${SEED_RESTAURANT_ID}/orders/`,
    );
  } finally {
    await removeMessage(id);
  }
});
