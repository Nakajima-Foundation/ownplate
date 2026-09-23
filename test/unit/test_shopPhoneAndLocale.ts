import { describe, it } from "node:test";
import assert from "node:assert";
import { ref } from "vue";

import {
  notFoundResponse,
  useFeatureHeroMobile,
  useFeatureHeroTablet,
  useNationalPhoneNumber,
  usePhoneNumber,
} from "../../src/utils/utils.ts";
import {
  optionPriceRegex,
  toSignedNumber,
} from "../../src/utils/commonUtils.ts";
import { runInLocale } from "../helpers/vueSetup.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";

// 店舗ページとレシートに出る電話番号。国番号を前に付けてから国内表記へ直す。
// 直せなかったときの振る舞いが2つの関数で違う。
const shop = (phoneNumber: string, countryCode?: string) =>
  restaurantInfoFixture({ phoneNumber, countryCode });

describe("usePhoneNumber", () => {
  it("writes a Japanese number the way it is written at home", () => {
    const { nationalPhoneNumber } = usePhoneNumber(ref(shop("9012345678")));
    assert.strictEqual(nationalPhoneNumber.value, "090-1234-5678");
  });

  it("assumes Japan when the shop names no country", () => {
    const { parsedNumber } = usePhoneNumber(ref(shop("9012345678")));
    assert.strictEqual(parsedNumber.value?.getCountryCode(), 81);
  });

  // 直せない番号はそのまま出す。空欄にすると店舗に連絡する手段が画面から消える。
  it("shows an unparseable number as the shop typed it", () => {
    const { nationalPhoneNumber } = usePhoneNumber(ref(shop("not-a-number")));
    assert.strictEqual(nationalPhoneNumber.value, "not-a-number");
  });

  it("follows the shop when its number changes", () => {
    const shopInfo = ref(shop("9012345678"));
    const { nationalPhoneNumber } = usePhoneNumber(shopInfo);
    assert.strictEqual(nationalPhoneNumber.value, "090-1234-5678");
    shopInfo.value = shop("312345678");
    assert.strictEqual(nationalPhoneNumber.value, "03-1234-5678");
  });
});

describe("useNationalPhoneNumber", () => {
  it("writes the number the way it is written at home", () => {
    const { nationalPhoneNumber } = useNationalPhoneNumber(shop("9012345678"));
    assert.strictEqual(nationalPhoneNumber.value, "090-1234-5678");
  });

  // こちらは直せなかったら空にする。受け取る側が「無い」と扱えるように。
  it("hands back nothing for a number it cannot read", () => {
    assert.strictEqual(
      useNationalPhoneNumber(shop("not-a-number")).nationalPhoneNumber.value,
      "",
    );
    assert.strictEqual(
      useNationalPhoneNumber(shop("")).nationalPhoneNumber.value,
      "",
    );
  });
});

// 言語で差し替える看板の画像。英語とフランス語だけ英語版、それ以外は日本語版。
describe("看板の画像", () => {
  // computed を返すので、.value は言語を戻す前に読む。外で読むと元の言語で答える。
  const mobileIn = (locale: string) =>
    runInLocale(locale, () => useFeatureHeroMobile().value);
  const tabletIn = (locale: string) =>
    runInLocale(locale, () => useFeatureHeroTablet().value);

  it("shows the Japanese artwork in Japanese", async () => {
    assert.strictEqual(await mobileIn("ja"), "Feature-Hero-Mobile-ja.svg");
    assert.strictEqual(await tabletIn("ja"), "Feature-Hero-Tablet-ja.svg");
  });

  it("shows the English artwork in English and French", async () => {
    assert.strictEqual(await mobileIn("en"), "Feature-Hero-Mobile-en.svg");
    assert.strictEqual(await mobileIn("fr"), "Feature-Hero-Mobile-en.svg");
  });

  // 訳が揃っていない言語も日本語版を出す。英語版が出ると日本の客に英語の看板が出る。
  it("shows the Japanese artwork for every other language", async () => {
    assert.strictEqual(await tabletIn("ko"), "Feature-Hero-Tablet-ja.svg");
  });
});

describe("notFoundResponse", () => {
  it("says the page was not found", () => {
    assert.deepStrictEqual(notFoundResponse, { notFound: true });
  });
});

// オプションの差額。全角の符号で入力されることがある（日本語の入力では出しやすい）。
describe("toSignedNumber", () => {
  it("reads a half-width signed number", () => {
    assert.strictEqual(toSignedNumber("+300"), 300);
    assert.strictEqual(toSignedNumber("-100"), -100);
  });

  it("reads a full-width plus and both kinds of full-width minus", () => {
    assert.strictEqual(toSignedNumber("＋300"), 300);
    assert.strictEqual(toSignedNumber("ー100"), -100);
    assert.strictEqual(toSignedNumber("−100"), -100);
  });

  it("keeps the fractional part", () => {
    assert.strictEqual(toSignedNumber("+1.5"), 1.5);
  });

  it("hands back NaN for something that is not a number", () => {
    assert.ok(Number.isNaN(toSignedNumber("+abc")));
  });
});

describe("optionPriceRegex", () => {
  const priceIn = (option: string) => option.match(optionPriceRegex)?.[1];

  it("finds the price in brackets at the end", () => {
    assert.strictEqual(priceIn("サイズL(+300)"), "+300");
    assert.strictEqual(priceIn("値引き(-100)"), "-100");
  });

  it("finds a full-width sign too", () => {
    assert.strictEqual(priceIn("サイズL(＋300)"), "＋300");
    assert.strictEqual(priceIn("値引き(ー100)"), "ー100");
  });

  // 符号の無い括弧は値段ではない。数えると、説明書きが金額として足される。
  it("ignores brackets that carry no sign", () => {
    assert.strictEqual(priceIn("大盛り(300g)"), undefined);
    assert.strictEqual(priceIn("のり"), undefined);
    assert.strictEqual(priceIn(""), undefined);
  });
});
