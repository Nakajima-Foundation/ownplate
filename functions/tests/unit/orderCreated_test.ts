import { describe, it } from "node:test";
import assert from "node:assert";

import { createNewOrderData, orderCreated } from "../../src/functions/order/orderCreated";
import { order_status } from "../../src/common/constant";
import { fakeFirestore } from "./helpers/fakeFirestore";

// お客様の Stripe の記録を先に置くので、createCustomer は Stripe を呼ばない。鍵は作るときに要るだけ。
process.env.STRIPE_SECRET ??= "sk_test_dummy";

const RESTAURANT = "shop1";
const ORDER = "order1";
const CUSTOMER = "customer1";
const orderPath = `restaurants/${RESTAURANT}/orders/${ORDER}`;
const restaurantPath = `restaurants/${RESTAURANT}`;

const signedIn = { auth: { uid: CUSTOMER, token: { phone_number: "+819012345678" } } };
const request = { restaurantId: RESTAURANT, orderId: ORDER };

const shop = { uid: "owner1", publicFlag: true, deletedFlag: false, inclusiveTax: false, foodTax: 8, alcoholTax: 10, orderCount: 41, enableDelivery: true };
const karaage = { price: 500, itemName: "からあげ", tax: "food", itemOptionCheckbox: ["大盛り (+100)"] };
const beer = { price: 600, itemName: "ビール", tax: "alcohol" };
// お客様の画面は rawOptions を convOptionArray2Obj で添字の object にして書く（Firestore は入れ子の配列を保存できない）。
const newOrder = {
  status: order_status.new_order,
  uid: CUSTOMER,
  name: "客",
  phoneNumber: "+819012345678",
  order: { karaage: [2], beer: 1 },
  rawOptions: { karaage: { 0: [true] } },
};

type Docs = Record<string, Record<string, unknown>>;
const world = (overrides: { shop?: object; order?: object; docs?: Docs } = {}): Docs => ({
  [restaurantPath]: { ...shop, ...overrides.shop },
  [`${restaurantPath}/menus/karaage`]: karaage,
  [`${restaurantPath}/menus/beer`]: beer,
  [orderPath]: { ...newOrder, ...overrides.order },
  [`users/${CUSTOMER}/system/stripe`]: { customerId: "cus_1" },
  ...overrides.docs,
});

const place = async (docs: Docs, context: object = signedIn, data: object = request) => {
  const { db, store, log } = fakeFirestore(docs);
  const result = await orderCreated(db, data, context);
  return { result, order: store.get(orderPath), restaurant: store.get(restaurantPath), log };
};

describe("orderCreated — 受け付ける注文", () => {
  it("prices the order from the menus and marks it validated", async () => {
    const { result, order, restaurant } = await place(world());
    assert.deepStrictEqual(result, { result: true });
    assert.strictEqual(order?.status, order_status.validation_ok);
    assert.deepStrictEqual(order?.order, { karaage: [2], beer: [1] });
    assert.deepStrictEqual(order?.prices, { karaage: [(500 + 100) * 2], beer: [600] });
    assert.deepStrictEqual(order?.options, { karaage: { 0: ["大盛り (+100)"] }, beer: { 0: [] } });
    // 外税: 食品 1200 の 8% と、お酒 600 の 10%
    assert.strictEqual(order?.sub_total, 1800);
    assert.strictEqual(order?.tax, 96 + 60);
    assert.strictEqual(order?.total, 1800 + 156);
    assert.deepStrictEqual(order?.accounting, { food: { revenue: 1200, tax: 96 }, alcohol: { revenue: 600, tax: 60 } });
    assert.strictEqual(order?.deliveryFee, 0);
    assert.strictEqual(order?.ownerUid, "owner1");
    assert.strictEqual(order?.name, "客");
    assert.strictEqual(order?.number, 41);
    assert.strictEqual(restaurant?.orderCount, 42);
  });

  it("keeps the tax inside the price when the shop shows tax-inclusive prices", async () => {
    const { order } = await place(world({ shop: { inclusiveTax: true } }));
    assert.strictEqual(order?.total, 1800);
    assert.strictEqual(order?.tax, Math.round(1200 * (1 - 1 / 1.08)) + Math.round(600 * (1 - 1 / 1.1)));
  });

  it("stores the option names the server resolved, not the ones the client sent", async () => {
    const { order } = await place(world({ order: { options: { karaage: { 0: ["客が書いた名前"] } } } }));
    assert.deepStrictEqual(order?.options, { karaage: { 0: ["大盛り (+100)"] }, beer: { 0: [] } });
  });

  it("adds the delivery fee, and waives it above the threshold", async () => {
    const area = (fee: object) => ({ docs: { [`${restaurantPath}/delivery/area`]: fee }, order: { isDelivery: true } });
    assert.strictEqual((await place(world(area({ deliveryFee: 300 })))).order?.deliveryFee, 300);
    assert.strictEqual((await place(world(area({ deliveryFee: 300, enableDeliveryFree: true, deliveryFreeThreshold: 1000 })))).order?.deliveryFee, 0);
  });

  it("drops a sold-out menu and keeps the rest of the order", async () => {
    const { order } = await place(world({ docs: { [`${restaurantPath}/menus/beer`]: { ...beer, soldOut: true } } }));
    assert.strictEqual(order?.status, order_status.validation_ok);
    assert.deepStrictEqual(order?.order, { karaage: [2] });
    assert.strictEqual(order?.sub_total, 1200);
  });

  it("counts a menu without a tax class as food", async () => {
    const water = { price: 100, itemName: "水" };
    const { order } = await place(world({ order: { order: { water: 1, beer: 1 } }, docs: { [`${restaurantPath}/menus/water`]: water } }));
    assert.deepStrictEqual(order?.accounting, { food: { revenue: 100, tax: 8 }, alcohol: { revenue: 600, tax: 60 } });
  });

  it("wraps the order number", async () => {
    const { order, restaurant } = await place(world({ shop: { orderCount: 999999 } }));
    assert.strictEqual(order?.number, 999999);
    assert.strictEqual(restaurant?.orderCount, 0);
  });

  it("accepts lunch or dinner when the shop splits them", async () => {
    const { order } = await place(world({ shop: { enableLunchDinner: true }, order: { lunchOrDinner: "dinner" } }));
    assert.strictEqual(order?.status, order_status.validation_ok);
    assert.strictEqual(order?.lunchOrDinner, "dinner");
  });
});

describe("orderCreated — 受け付けない注文は error にする", () => {
  const rejected = async (docs: Docs) => {
    const { order, log } = await place(docs);
    assert.strictEqual(order?.status, order_status.error);
    assert.ok(!log.some((line) => line.startsWith(`set ${orderPath}`)), "the priced order must not be stored");
  };

  it("rejects delivery, LINE or lunch/dinner the shop does not take", async () => {
    await rejected(world({ shop: { enableDelivery: false }, order: { isDelivery: true } }));
    await rejected(world({ shop: { supportLiff: false }, order: { isLiff: true } }));
    await rejected(world({ shop: { enableLunchDinner: true }, order: {} }));
    await rejected(world({ shop: { enableLunchDinner: false }, order: { lunchOrDinner: "lunch" } }));
  });

  it("rejects an order for a menu that does not exist", async () => {
    await rejected(world({ order: { order: { karaage: 1, gone: 1 } } }));
  });

  it("rejects an order whose menus are all sold out", async () => {
    await rejected(world({ docs: { [`${restaurantPath}/menus/karaage`]: { ...karaage, soldOut: true }, [`${restaurantPath}/menus/beer`]: { ...beer, soldOut: true } } }));
  });

  it("rejects a negative or non-integer quantity", async () => {
    await rejected(world({ order: { order: { karaage: -1 } } }));
    await rejected(world({ order: { order: { karaage: 1.5 } } }));
  });

  it("rejects an order that is not the caller's, or not new", async () => {
    await rejected(world({ order: { uid: "someone-else" } }));
    await rejected(world({ order: { status: order_status.validation_ok } }));
  });

  it("rejects an order at a shop that is closed to the public", async () => {
    await rejected(world({ shop: { publicFlag: false } }));
    await rejected(world({ shop: { deletedFlag: true } }));
  });
});

describe("orderCreated — 呼び出しそのものを断る", () => {
  it("refuses a caller who has not signed in with a phone number, without writing", async () => {
    const { db, log } = fakeFirestore(world());
    await assert.rejects(orderCreated(db, request, { auth: { uid: CUSTOMER, token: {} } }), /authenticated/);
    assert.deepStrictEqual(log, []);
  });

  it("refuses a malformed id, without writing", async () => {
    const { db, log } = fakeFirestore(world());
    await assert.rejects(orderCreated(db, { restaurantId: "bad/id", orderId: ORDER }, signedIn), /Validation Error/);
    assert.deepStrictEqual(log, []);
  });
});

// 種を固定した生成入力で、保存される注文の中身どうしが合っていること。
describe("orderCreated — 保存される注文の中身が合っている", () => {
  it("keeps lines aligned and the totals equal to the line prices", async () => {
    const seed = 20260929;
    const next = (state: number) => (state * 1103515245 + 12345) % 2147483648;
    const states = Array.from({ length: 60 }, (_, index) => next(seed + index));
    for (const state of states) {
      const quantities = [1 + (state % 3), next(state) % 3];
      const docs = world({
        shop: { inclusiveTax: state % 2 === 0 },
        order: {
          order: { karaage: quantities, beer: 1 + (next(next(state)) % 2) },
          rawOptions: { karaage: Object.fromEntries(quantities.map((_quantity, line) => [line, [line % 2 === 0]])) },
        },
        docs: { [`${restaurantPath}/menus/beer`]: { ...beer, soldOut: state % 5 === 0 } },
      });
      const { order } = await place(docs);
      assert.strictEqual(order?.status, order_status.validation_ok, `seed ${seed}`);
      const lines = order?.order as Record<string, number[]>;
      const prices = order?.prices as Record<string, number[]>;
      const options = order?.options as Record<string, Record<string, string[]>>;
      Object.keys(lines).forEach((menuId) => {
        assert.strictEqual(prices[menuId].length, lines[menuId].length, `seed ${seed}`);
        assert.strictEqual(Object.keys(options[menuId]).length, lines[menuId].length, `seed ${seed}`);
      });
      const lineTotal = Object.values(prices)
        .flat()
        .reduce((sum, price) => sum + price, 0);
      assert.strictEqual(order?.sub_total, lineTotal, `seed ${seed}`);
      assert.strictEqual(order?.total, order?.inclusiveTax ? lineTotal : lineTotal + Number(order?.tax), `seed ${seed}`);
    }
  });
});

// orderChange.ts も呼ぶので、orderCreated の外から見えない違い（見つからないメニューを先に断るか）もここで留める。
describe("createNewOrderData", () => {
  const refs = (docs: Docs) => {
    const { db, store, log } = fakeFirestore(docs);
    return { restaurantRef: db.doc(restaurantPath), orderRef: db.doc(orderPath), store, log };
  };

  it("marks the order as error and returns no data when a menu is missing", async () => {
    const { restaurantRef, orderRef, store, log } = refs(world());
    const result = await createNewOrderData(restaurantRef, orderRef, { order: { karaage: 1, gone: 1 } }, 1);
    assert.deepStrictEqual(result, { result: false });
    assert.strictEqual(store.get(orderPath)?.status, order_status.error);
    assert.deepStrictEqual(log, [`update ${orderPath} {"status":${order_status.error}}`]);
  });

  it("returns the priced lines and writes nothing when every menu is there", async () => {
    const { restaurantRef, orderRef, log } = refs(world());
    const result = await createNewOrderData(restaurantRef, orderRef, { order: { karaage: 1 } }, 1);
    assert.strictEqual(result.result, true);
    assert.deepStrictEqual(result.result && result.data.newPrices, { karaage: [500] });
    assert.deepStrictEqual(log, []);
  });
});
