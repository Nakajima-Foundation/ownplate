import { describe, it } from "node:test";
import assert from "node:assert";

import {
  displayOption,
  getPartner,
  orderType,
  orderTypeKey,
  useToggle,
} from "../../src/utils/utils.ts";
import { partners } from "../../src/config/constant.ts";
import { runInSetup } from "../helpers/vueSetup.ts";
import { orderInfoFixture } from "../fixtures/orderInfo.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";
import { menuFixture } from "../fixtures/menu.ts";

// 受渡方法。レシート、通知の文面、注文一覧の絞り込みがこれで分岐する。
// 3つのうち2つが同時に立つことは無く、立つ順番が決まっている。
describe("orderType", () => {
  it("calls a net-shop order EC", () => {
    assert.strictEqual(orderType(orderInfoFixture({ isEC: true })), "EC");
  });

  it("calls a delivery order Delivery", () => {
    assert.strictEqual(
      orderType(orderInfoFixture({ isDelivery: true })),
      "Delivery",
    );
  });

  it("calls everything else Takeout", () => {
    assert.strictEqual(orderType(orderInfoFixture()), "Takeout");
    assert.strictEqual(
      orderType(orderInfoFixture({ isEC: false, isDelivery: false })),
      "Takeout",
    );
  });

  // 両方立っている注文は EC が勝つ。配送料の行と送り先の欄がこれで変わる。
  it("prefers EC when an order carries both", () => {
    assert.strictEqual(
      orderType(orderInfoFixture({ isEC: true, isDelivery: true })),
      "EC",
    );
  });
});

describe("orderTypeKey", () => {
  it("makes the i18n key from the type", () => {
    assert.strictEqual(orderTypeKey(orderInfoFixture()), "orderTypeTakeout");
    assert.strictEqual(
      orderTypeKey(orderInfoFixture({ isEC: true })),
      "orderTypeEC",
    );
    assert.strictEqual(
      orderTypeKey(orderInfoFixture({ isDelivery: true })),
      "orderTypeDelivery",
    );
  });
});

// 店舗の提携先。管理画面の同意欄と店舗ページの表示がこれで決まる。
describe("getPartner", () => {
  const known = partners[0].id;

  it("looks up the partner the owner is tied to", () => {
    const found = getPartner({ partners: [known], hidePrivacy: false });
    assert.strictEqual(found.length, 1);
    assert.strictEqual(found[0]?.id, known);
    assert.strictEqual(found[0]?.name, partners[0].name);
  });

  it("looks up every one of them", () => {
    const found = getPartner({
      partners: partners.map((partner) => partner.id),
      hidePrivacy: false,
    });
    assert.deepStrictEqual(
      found.map((partner) => partner?.id),
      partners.map((partner) => partner.id),
    );
  });

  it("finds nothing for an owner with no partner", () => {
    assert.deepStrictEqual(getPartner({ hidePrivacy: false }), []);
    assert.deepStrictEqual(
      getPartner({ partners: [], hidePrivacy: false }),
      [],
    );
  });

  // 提携先が消されたあとも、店舗側には id が残る。行は残るが中身は undefined になるので、
  // 表示側は穴を考えなければならない。
  it("leaves a hole rather than dropping an id it does not know", () => {
    const found = getPartner({
      partners: ["gone", known],
      hidePrivacy: false,
    });
    assert.strictEqual(found.length, 2);
    assert.strictEqual(found[0], undefined);
    assert.strictEqual(found[1]?.id, known);
  });
});

// 開閉の状態。拡大表示や折りたたみがこれで動く。
describe("useToggle", () => {
  it("starts shut unless told otherwise", () => {
    assert.strictEqual(useToggle().value.value, false);
    assert.strictEqual(useToggle(true).value.value, true);
  });

  it("opens and shuts on demand", () => {
    const { value, toggleOn, toggleOff } = useToggle();
    toggleOn();
    assert.strictEqual(value.value, true);
    toggleOn();
    assert.strictEqual(value.value, true);
    toggleOff();
    assert.strictEqual(value.value, false);
  });

  it("flips whichever way it is facing", () => {
    const { value, toggle } = useToggle();
    toggle();
    assert.strictEqual(value.value, true);
    toggle();
    assert.strictEqual(value.value, false);
  });

  it("hands each caller its own state", () => {
    const first = useToggle();
    const second = useToggle();
    first.toggleOn();
    assert.strictEqual(second.value.value, false);
  });
});

// オプションの表示。差額に税を乗せてから通貨の形にする。カートとレシートに出るのは
// この文字列で、税を乗せ忘れると客が見る額と請求額が食い違う。
describe("displayOption", () => {
  const show = (option: string, inclusiveTax: boolean) =>
    runInSetup(() =>
      displayOption(
        option,
        restaurantInfoFixture({ inclusiveTax, foodTax: 10, alcoholTax: 10 }),
        menuFixture({ tax: "food" }),
      ),
    );

  it("adds the tax for a tax-exclusive shop", async () => {
    assert.strictEqual(await show("L(+300)", false), "L(+￥330)");
  });

  it("adds nothing for a tax-inclusive shop", async () => {
    assert.strictEqual(await show("L(+300)", true), "L(+￥300)");
  });

  it("keeps the minus on a discount", async () => {
    assert.strictEqual(await show("S(-100)", true), "S(-￥100)");
  });

  it("leaves an option with no price alone", async () => {
    assert.strictEqual(await show("のり", true), "のり");
    assert.strictEqual(await show("", true), "");
  });
});
