// 店舗側の設定を、画面を通さず Firestore へ直に置く。画面から変えると管理画面の
// 一覧や Stripe の連携まで巻き込むので、見たいものだけを動かせるようにする。
// エミュレーターは owner を名乗る要求を管理権限として扱い、規則を通さない。
import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import {
  SEED_DELIVERY_RESTAURANT_ID,
  SEED_EDIT_RESTAURANT_ID,
  SEED_EDIT_RESTAURANT_NAME,
  SEED_MENU_ID,
  SEED_OPEN_TIME,
  SEED_PROMOTION_ID,
  SEED_RESTAURANT_ID,
} from "../../scripts/seedData";

const DOCUMENTS_URL =
  `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}` +
  `/v1/projects/ownplate-dev/databases/(default)/documents`;

// Firestore の REST が受け取る値の形（使う分だけ）。
type FirestoreValue =
  | { booleanValue: boolean }
  | { integerValue: string }
  | { arrayValue: { values: FirestoreValue[] } }
  | { mapValue: { fields: { [key: string]: FirestoreValue } } };

const patchField = async (
  path: string,
  field: string,
  value: FirestoreValue,
  what: string,
) => {
  const response = await fetch(
    `${DOCUMENTS_URL}/${path}?updateMask.fieldPaths=${field}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer owner",
      },
      body: JSON.stringify({ fields: { [field]: value } }),
    },
  );
  if (!response.ok) {
    throw new Error(`${what}を変えられません: ${response.status}`);
  }
};

export const setSoldOut = (soldOut: boolean) =>
  patchField(
    `restaurants/${SEED_RESTAURANT_ID}/menus/${SEED_MENU_ID}`,
    "soldOut",
    { booleanValue: soldOut },
    "売り切れ",
  );

// 商品の受取除外（曜日と時間帯）。null で項目ごと消す（種まきの商品は持っていない）。
export type MenuExcept = {
  exceptDay: { [day: string]: boolean };
  exceptHour: { start: number; end: number };
};

export const setMenuExcept = async (except: MenuExcept | null) => {
  const fields: { [key: string]: FirestoreValue } = except
    ? {
        exceptDay: {
          mapValue: {
            fields: Object.fromEntries(
              Object.entries(except.exceptDay).map(([day, flag]) => [
                day,
                { booleanValue: flag },
              ]),
            ),
          },
        },
        exceptHour: {
          mapValue: {
            fields: {
              start: { integerValue: String(except.exceptHour.start) },
              end: { integerValue: String(except.exceptHour.end) },
            },
          },
        },
      }
    : {};
  const response = await fetch(
    `${DOCUMENTS_URL}/restaurants/${SEED_RESTAURANT_ID}/menus/${SEED_MENU_ID}` +
      "?updateMask.fieldPaths=exceptDay&updateMask.fieldPaths=exceptHour",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer owner",
      },
      body: JSON.stringify({ fields }),
    },
  );
  if (!response.ok) {
    throw new Error(`商品の受取除外を変えられません: ${response.status}`);
  }
};

// 配送条件。手順書は「設定 → 判定表」の形で書かれているので、設定を置ける口を
// 用意しておく。地図は描かせない（確認画面が Google を待つと金額まで進めない）。
export type DeliveryArea = {
  enableDeliveryThreshold: boolean;
  deliveryThreshold: number;
  deliveryFee: number;
  enableDeliveryFree: boolean;
  deliveryFreeThreshold: number;
};

export const setDeliveryArea = async (area: DeliveryArea) => {
  const response = await fetch(
    `${DOCUMENTS_URL}/restaurants/${SEED_DELIVERY_RESTAURANT_ID}/delivery/area`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer owner",
      },
      body: JSON.stringify({
        fields: {
          enableAreaMap: { booleanValue: false },
          enableAreaText: { booleanValue: false },
          radius: { integerValue: String(500) },
          areaText: { stringValue: "" },
          enableDeliveryThreshold: {
            booleanValue: area.enableDeliveryThreshold,
          },
          deliveryThreshold: { integerValue: String(area.deliveryThreshold) },
          deliveryFee: { integerValue: String(area.deliveryFee) },
          enableDeliveryFree: { booleanValue: area.enableDeliveryFree },
          deliveryFreeThreshold: {
            integerValue: String(area.deliveryFreeThreshold),
          },
        },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`配送条件を変えられません: ${response.status}`);
  }
};

const WEEKDAYS = ["1", "2", "3", "4", "5", "6", "7"];

// 毎日同じ営業時間（開店は種まきのまま）にする。閉店は 0 時からの分数。
export const setClosingTime = (closeTime: number) => {
  const oneSpan: FirestoreValue = {
    arrayValue: {
      values: [
        {
          mapValue: {
            fields: {
              start: { integerValue: String(SEED_OPEN_TIME) },
              end: { integerValue: String(closeTime) },
            },
          },
        },
      ],
    },
  };
  return patchField(
    `restaurants/${SEED_RESTAURANT_ID}`,
    "openTimes",
    {
      mapValue: {
        fields: Object.fromEntries(WEEKDAYS.map((day) => [day, oneSpan])),
      },
    },
    "営業時間",
  );
};

// 保存を伴う試験の後片付け。**画面から戻すと当てにならない** — 店情報の画面は
// チェック欄をいくつも持ち、位置で掴むと別の設定を読んでしまう。値を直に戻す。
export const resetEditRestaurant = async () => {
  const response = await fetch(
    `${DOCUMENTS_URL}/restaurants/${SEED_EDIT_RESTAURANT_ID}` +
      `?updateMask.fieldPaths=restaurantName` +
      `&updateMask.fieldPaths=inclusiveTax` +
      `&updateMask.fieldPaths=acceptUserMessage`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer owner",
      },
      body: JSON.stringify({
        fields: {
          restaurantName: { stringValue: SEED_EDIT_RESTAURANT_NAME },
          inclusiveTax: { booleanValue: false },
          acceptUserMessage: { booleanValue: false },
        },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`編集用店舗を戻せません: ${response.status}`);
  }
};

// 値引きが使える支払い方法。"stripe" ならカード払いのときだけ、"instore" なら
// 受け取り払いのときだけ効く（promotionRules の isPaymentAllowed）。
// null は「絞らない」——Firestore では値の無い null をそう置く。
export type PaymentRestriction = "stripe" | "instore" | null;

const patchPromotion = async (
  fields: { [key: string]: unknown },
  what: string,
) => {
  const mask = Object.keys(fields)
    .map((name) => `updateMask.fieldPaths=${name}`)
    .join("&");
  const response = await fetch(
    `${DOCUMENTS_URL}/restaurants/${SEED_RESTAURANT_ID}/promotions/${SEED_PROMOTION_ID}?${mask}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer owner",
      },
      body: JSON.stringify({ fields }),
    },
  );
  if (!response.ok) {
    throw new Error(`${what}を変えられません: ${response.status}`);
  }
};

// 利用回数の制限。真にすると、一度使った人にはキャンペーンが出なくなる
// （promotionRules の usablePromotions）。
export const setPromotionUsageRestriction = (restricted: boolean) =>
  patchPromotion(
    { usageRestrictions: { booleanValue: restricted } },
    "利用回数の制限",
  );

// キャンペーンの終わり。過去にすると、客側の取り込みの条件
// （termTo > いま）から外れる。
export const setPromotionTermTo = (termTo: Date) =>
  patchPromotion(
    { termTo: { timestampValue: termTo.toISOString() } },
    "キャンペーンの期限",
  );

export const setPromotionPaymentRestriction = async (
  restriction: PaymentRestriction,
) => {
  const value =
    restriction === null ? { nullValue: null } : { stringValue: restriction };
  const response = await fetch(
    `${DOCUMENTS_URL}/restaurants/${SEED_RESTAURANT_ID}/promotions/${SEED_PROMOTION_ID}` +
      `?updateMask.fieldPaths=paymentRestrictions`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer owner",
      },
      body: JSON.stringify({ fields: { paymentRestrictions: value } }),
    },
  );
  if (!response.ok) {
    throw new Error(`値引きの支払い制限を変えられません: ${response.status}`);
  }
};

// 掲載の申し込み。申し込むと requestList に文書ができ、取り消すと消える。
// 試験のあとに残すと、次に走らせたとき「申請中」から始まってしまう。
export const clearListingRequest = async () => {
  const response = await fetch(
    `${DOCUMENTS_URL}/requestList/${SEED_EDIT_RESTAURANT_ID}`,
    { method: "DELETE", headers: { Authorization: "Bearer owner" } },
  );
  // 無いときの 404 は片付けとしては正しい。
  if (!response.ok && response.status !== 404) {
    throw new Error(`掲載の申し込みを消せません: ${response.status}`);
  }
};
