import { describe, it } from "node:test";
import assert from "node:assert";

import {
  defaultShopInfo,
  shopInfoValidator,
} from "../../src/utils/admin/shopInfoForm.ts";
import {
  businessHoursErrors,
  type OpenTimeSlot,
} from "../../src/utils/admin/businessHours.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";

// 店舗情報の入力検証。返す一覧が、保存ボタンを止めるか・公開のチェックを止めるか・
// どの欄を赤くするかを決める。緩めると必須の欄が空のまま公開される。
//
// 返り値は「欄の名前 → 翻訳の鍵の一覧」。空の配列は「その欄は問題なし」。
const shop = restaurantInfoFixture;
const NO_PHONE_ERROR: string[] = [];

const errorsFor = (
  overrides: Parameters<typeof restaurantInfoFixture>[0] = {},
  phoneErrors: string[] = NO_PHONE_ERROR,
  profileFile?: File,
  coverFile?: File,
) => shopInfoValidator(shop(overrides), phoneErrors, profileFile, coverFile);

const complained = (field: string, overrides = {}) => {
  const value = errorsFor(overrides)[field];
  assert.ok(Array.isArray(value), `${field} は一覧ではない`);
  return value;
};

describe("shopInfoValidator — 何も問題が無い店舗", () => {
  it("finds nothing wrong with a shop that has everything", () => {
    const errors = errorsFor();
    Object.entries(errors).forEach(([field, value]) => {
      if (field === "time") {
        return;
      }
      assert.deepStrictEqual(value, [], `${field} に文句が出ている`);
    });
  });

  // 画面は errors['<欄>'].length を直に読む。検証していない欄も空の一覧で
  // 入っていないと、そこで落ちる。
  it("carries a list for every field the screen reads, checked or not", () => {
    const errors = errorsFor();
    [
      "restaurantName",
      "ownerName",
      "streetAddress",
      "city",
      "state",
      "zip",
      "phoneNumber",
      "pickUpMinimumCookTime",
      "pickUpDaysInAdvance",
      "introduction",
      "orderNotice",
      "orderThanks",
      "invoiceNumber",
      "url",
      "lineUrl",
      "instagramUrl",
      "uberEatsUrl",
      "restProfilePhoto",
      "restCoverPhoto",
      "time",
    ].forEach((field) => {
      assert.ok(errors[field] !== undefined, `${field} が入っていない`);
    });
  });
});

describe("shopInfoValidator — 必須の欄", () => {
  const required = [
    "restaurantName",
    "ownerName",
    "streetAddress",
    "city",
    "state",
    "zip",
  ];

  it("complains about each required field left empty", () => {
    required.forEach((field) => {
      assert.deepStrictEqual(
        complained(field, { [field]: "" }),
        [`validationError.${field}.empty`],
        `${field} が空なのに通っている`,
      );
    });
  });

  it("complains about each of them separately", () => {
    const errors = errorsFor({ restaurantName: "", city: "" });
    assert.deepStrictEqual(errors.restaurantName, [
      "validationError.restaurantName.empty",
    ]);
    assert.deepStrictEqual(errors.city, ["validationError.city.empty"]);
    assert.deepStrictEqual(errors.ownerName, []);
  });

  // 見ているのは空文字だけ。空白だけの入力は通る。
  it("lets a field of nothing but spaces through", () => {
    assert.deepStrictEqual(
      complained("restaurantName", { restaurantName: " " }),
      [],
    );
  });

  // 電話番号だけは別。ここで空を見たあと、呼び出し側が渡した一覧で上書きされる。
  // 空の電話番号は入力部品が組み込み時に弾くので、そちらから来る。
  it("takes the phone number's complaints from the caller, not from the empty check", () => {
    assert.deepStrictEqual(errorsFor({ phoneNumber: "" }).phoneNumber, []);
    assert.deepStrictEqual(
      errorsFor({ phoneNumber: "" }, ["sms.invalidPhoneNumber"]).phoneNumber,
      ["sms.invalidPhoneNumber"],
    );
    assert.deepStrictEqual(
      errorsFor({ phoneNumber: "0312345678" }, ["sms.invalidPhoneNumber"])
        .phoneNumber,
      ["sms.invalidPhoneNumber"],
    );
  });
});

// 免税事業者は番号を持たないので、未設定は通す。形が違うものだけ弾く。
describe("shopInfoValidator — 登録番号", () => {
  it("lets an unset number through", () => {
    assert.deepStrictEqual(
      complained("invoiceNumber", { invoiceNumber: "" }),
      [],
    );
    assert.deepStrictEqual(
      complained("invoiceNumber", { invoiceNumber: undefined }),
      [],
    );
  });

  it("accepts the shape the tax office issues", () => {
    assert.deepStrictEqual(
      complained("invoiceNumber", { invoiceNumber: "T1234567890123" }),
      [],
    );
  });

  it("complains about a number of the wrong shape", () => {
    ["1234567890123", "T123", "Tabcdefghijklm", "T12345678901234"].forEach(
      (wrong) => {
        assert.deepStrictEqual(
          complained("invoiceNumber", { invoiceNumber: wrong }),
          ["validationError.invoiceNumber.format"],
          `${wrong} が通っている`,
        );
      },
    );
  });
});

// 受け取りまでの最短時間。長すぎる・負・整数でないを別々に言う。
describe("shopInfoValidator — 調理にかかる時間", () => {
  const complain = (pickUpMinimumCookTime: unknown) =>
    complained("pickUpMinimumCookTime", { pickUpMinimumCookTime });

  it("accepts a whole number of minutes", () => {
    assert.deepStrictEqual(complain(0), []);
    assert.deepStrictEqual(complain(25), []);
  });

  // 上限はちょうど7日まで。境目が動くと、一週間先の予約が通ったり通らなくなったりする。
  it("accepts exactly seven days and refuses a minute more", () => {
    assert.deepStrictEqual(complain(7 * 24 * 60), []);
    assert.deepStrictEqual(complain(7 * 24 * 60 + 1), [
      "validationError.pickUpMinimumCookTime.tooMuch",
    ]);
  });

  it("refuses a negative time", () => {
    assert.deepStrictEqual(complain(-1), [
      "validationError.pickUpMinimumCookTime.negative",
    ]);
  });

  it("refuses anything that is not a whole number", () => {
    [1.5, NaN, Infinity, "25", null, undefined].forEach((wrong) => {
      assert.deepStrictEqual(
        complain(wrong),
        ["validationError.pickUpMinimumCookTime.notNumbery"],
        `${String(wrong)} が通っている`,
      );
    });
  });
});

// 何日前から予約を受けるか。用意した選択肢の値しか許さない。
describe("shopInfoValidator — 何日前から受けるか", () => {
  const complain = (pickUpDaysInAdvance: unknown) =>
    complained("pickUpDaysInAdvance", { pickUpDaysInAdvance });

  it("accepts every choice the screen offers", () => {
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((days) => {
      assert.deepStrictEqual(complain(days), [], `${days} が弾かれている`);
    });
  });

  it("refuses a value that is not one of them", () => {
    [8, -1, 1.5, "3", null, undefined].forEach((wrong) => {
      assert.deepStrictEqual(
        complain(wrong),
        ["validationError.pickUpDaysInAdvance.invalid"],
        `${String(wrong)} が通っている`,
      );
    });
  });
});

// 店舗が貼る外部リンク。店舗ページから客が踏むので、http と https 以外は通さない。
describe("shopInfoValidator — 外部リンク", () => {
  const links = ["url", "lineUrl", "instagramUrl", "uberEatsUrl"];

  it("accepts an ordinary web address in every link", () => {
    links.forEach((field) => {
      assert.deepStrictEqual(
        complained(field, { [field]: "https://example.com/shop" }),
        [],
      );
      assert.deepStrictEqual(
        complained(field, { [field]: "http://example.com" }),
        [],
      );
    });
  });

  it("lets an unset link through", () => {
    links.forEach((field) => {
      assert.deepStrictEqual(complained(field, { [field]: "" }), []);
      assert.deepStrictEqual(complained(field, { [field]: undefined }), []);
    });
  });

  it("refuses anything that is not a web address", () => {
    links.forEach((field) => {
      [
        "javascript:alert(1)",
        "data:text/html,x",
        "ftp://example.com",
        "example.com",
        "//example.com",
        "https://",
      ].forEach((wrong) => {
        assert.deepStrictEqual(
          complained(field, { [field]: wrong }),
          [`validationError.${field}.invalidUrl`],
          `${field} が ${wrong} を通している`,
        );
      });
    });
  });

  it("refuses an address carrying a space", () => {
    assert.deepStrictEqual(
      complained("url", { url: "https://example.com/a b" }),
      ["validationError.url.invalidUrl"],
    );
  });
});

// 営業時間の規則。画面の時刻選択は空欄を選ぶと項目ごと消すので、片方だけ入っている形も
// 枠そのものが無い形も来る。その形を渡せるように、規則を別の関数に切り出してある。
describe("businessHoursErrors", () => {
  const openDay = (slots: OpenTimeSlot[] | undefined) =>
    businessHoursErrors(true, slots);

  // 休業日は時間を見ない。見ると、閉めている曜日の空欄で保存が止まる。
  it("says nothing about a day the shop is closed", () => {
    assert.deepStrictEqual(businessHoursErrors(false, undefined), [[], []]);
    assert.deepStrictEqual(businessHoursErrors(false, []), [[], []]);
    assert.deepStrictEqual(
      businessHoursErrors(false, [{ start: 900, end: 660 }]),
      [[], []],
    );
  });

  it("always answers for both slots, in order", () => {
    assert.strictEqual(openDay(undefined).length, 2);
    assert.strictEqual(businessHoursErrors(false, undefined).length, 2);
  });

  it("wants a first slot on a day the shop is open", () => {
    assert.deepStrictEqual(openDay(undefined), [
      ["validationError.noSelect"],
      [],
    ]);
    assert.deepStrictEqual(openDay([]), [["validationError.noSelect"], []]);
    assert.deepStrictEqual(openDay([null]), [["validationError.noSelect"], []]);
  });

  // 2枠目は任意。夜の部を置かない店舗が止まらないように。
  it("does not ask for a second slot", () => {
    assert.deepStrictEqual(openDay([{ start: 660, end: 840 }]), [[], []]);
    assert.deepStrictEqual(openDay([{ start: 660, end: 840 }, null]), [[], []]);
  });

  it("accepts a day with both slots filled", () => {
    assert.deepStrictEqual(
      openDay([
        { start: 660, end: 840 },
        { start: 1020, end: 1320 },
      ]),
      [[], []],
    );
  });

  it("complains when only one end of a slot is set", () => {
    assert.deepStrictEqual(openDay([{ start: 660 }]), [
      ["validationError.oneInEmpty"],
      [],
    ]);
    assert.deepStrictEqual(openDay([{ end: 840 }]), [
      ["validationError.oneInEmpty"],
      [],
    ]);
    assert.deepStrictEqual(openDay([{ start: 660, end: null }]), [
      ["validationError.oneInEmpty"],
      [],
    ]);
  });

  // 両方とも空の枠は「片方だけ」ではないので、そこは何も言わない。
  it("says nothing about a slot with neither end set", () => {
    assert.deepStrictEqual(openDay([{}]), [[], []]);
    assert.deepStrictEqual(openDay([{ start: null, end: null }]), [[], []]);
  });

  it("complains when a slot ends before it starts", () => {
    assert.deepStrictEqual(openDay([{ start: 900, end: 660 }]), [
      ["validationError.validBusinessTime"],
      [],
    ]);
  });

  // 境目。開始と終了が同じ枠は通る。
  it("accepts a slot that starts and ends at the same minute", () => {
    assert.deepStrictEqual(openDay([{ start: 660, end: 660 }]), [[], []]);
  });

  // 真夜中は 0。偽値なので、空欄と取り違えると深夜営業の店舗が保存できなくなる。
  it("treats midnight as a time, not as an empty field", () => {
    assert.deepStrictEqual(openDay([{ start: 0, end: 840 }]), [[], []]);
    assert.deepStrictEqual(openDay([{ start: 0, end: 0 }]), [[], []]);
    assert.deepStrictEqual(openDay([{ start: 0, end: null }]), [
      ["validationError.oneInEmpty"],
      [],
    ]);
  });

  it("points at the slot that is wrong, not the other one", () => {
    assert.deepStrictEqual(
      openDay([
        { start: 660, end: 840 },
        { start: 1320, end: 1020 },
      ]),
      [[], ["validationError.validBusinessTime"]],
    );
  });

  it("ignores anything beyond the two slots", () => {
    assert.deepStrictEqual(
      openDay([
        { start: 660, end: 840 },
        { start: 1020, end: 1320 },
        { start: 1320, end: 1020 },
      ]),
      [[], []],
    );
  });
});

// 検証を通して見たときも同じ答えになること。曜日ごとに別々に見る。
describe("shopInfoValidator — 営業時間", () => {
  const timeErrors = (
    businessDay: { [key: string]: string[] },
    openTimes: { [key: string]: { start: number; end: number }[] },
  ) => {
    const value = errorsFor({ businessDay, openTimes }).time;
    assert.ok(value && !Array.isArray(value), "time が入れ子になっていない");
    return value;
  };

  it("reports two slots for every day of the week", () => {
    const all = timeErrors({}, {});
    assert.deepStrictEqual(Object.keys(all), [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
    ]);
    Object.values(all).forEach((day) => {
      assert.deepStrictEqual(day, [[], []]);
    });
  });

  it("checks each day of the week on its own", () => {
    const all = timeErrors(
      { "1": ["open"], "2": ["open"] },
      { "1": [{ start: 660, end: 840 }], "2": [] },
    );
    assert.deepStrictEqual(all["1"], [[], []]);
    assert.deepStrictEqual(all["2"], [["validationError.noSelect"], []]);
    assert.deepStrictEqual(all["3"], [[], []]);
  });

  it("carries a wrong slot through to the field the screen reads", () => {
    const all = timeErrors(
      { "1": ["open"] },
      { "1": [{ start: 900, end: 660 }] },
    );
    assert.deepStrictEqual(all["1"], [
      ["validationError.validBusinessTime"],
      [],
    ]);
  });
});

// 店舗ページに出る2枚の写真。どちらも無いと公開できない。
describe("shopInfoValidator — 写真", () => {
  const unset = { restProfilePhoto: undefined, restCoverPhoto: undefined };

  it("wants both photos on a shop that has neither", () => {
    const errors = errorsFor(unset);
    assert.deepStrictEqual(errors.restProfilePhoto, [
      "validationError.restProfilePhoto.empty",
    ]);
    assert.deepStrictEqual(errors.restCoverPhoto, [
      "validationError.restCoverPhoto.empty",
    ]);
  });

  it("is satisfied by a photo already saved on the shop", () => {
    const errors = errorsFor();
    assert.deepStrictEqual(errors.restProfilePhoto, []);
    assert.deepStrictEqual(errors.restCoverPhoto, []);
  });

  // 選んだばかりでまだ上げていないファイルも数える。上げる前に保存を止めると、
  // 写真を選んだのに保存できない画面になる。
  it("is satisfied by a file the owner has just picked", () => {
    const picked = new File([], "profile.jpg");
    const errors = errorsFor(unset, NO_PHONE_ERROR, picked);
    assert.deepStrictEqual(errors.restProfilePhoto, []);
    assert.deepStrictEqual(errors.restCoverPhoto, [
      "validationError.restCoverPhoto.empty",
    ]);
  });

  it("takes the two photos separately", () => {
    const picked = new File([], "cover.jpg");
    const errors = errorsFor(unset, NO_PHONE_ERROR, undefined, picked);
    assert.deepStrictEqual(errors.restProfilePhoto, [
      "validationError.restProfilePhoto.empty",
    ]);
    assert.deepStrictEqual(errors.restCoverPhoto, []);
  });
});

// 新しい店舗の初期値。ここに無い欄は、編集画面を開いた時点では undefined。
describe("defaultShopInfo", () => {
  it("starts a new shop with the required text fields empty", () => {
    [
      "restaurantName",
      "ownerName",
      "streetAddress",
      "city",
      "state",
      "zip",
    ].forEach((field) => {
      assert.strictEqual(
        defaultShopInfo[field as keyof typeof defaultShopInfo],
        "",
        `${field} の初期値が空文字ではない`,
      );
    });
  });

  // 写真は鍵ごと無い。空文字を入れると、検証が「設定済み」と読んでしまう
  // （見ているのは null と undefined だけなので）。
  it("carries no photo keys at all, which is what makes the check fire", () => {
    assert.ok(!("restProfilePhoto" in defaultShopInfo));
    assert.ok(!("restCoverPhoto" in defaultShopInfo));
  });

  it("starts a new shop unpublished", () => {
    assert.strictEqual(defaultShopInfo.publicFlag, false);
  });
});
