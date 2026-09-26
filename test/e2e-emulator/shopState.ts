// 店舗側の設定を、画面を通さず Firestore へ直に置く。画面から変えると管理画面の
// 一覧や Stripe の連携まで巻き込むので、見たいものだけを動かせるようにする。
// エミュレーターは owner を名乗る要求を管理権限として扱い、規則を通さない。
import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import {
  SEED_MENU_ID,
  SEED_PROMOTION_ID,
  SEED_RESTAURANT_ID,
} from "../../scripts/seedData";

const DOCUMENTS_URL =
  `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}` +
  `/v1/projects/ownplate-dev/databases/(default)/documents`;

const patchField = async (
  path: string,
  field: string,
  value: { booleanValue: boolean },
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

// 値引きが使える支払い方法。"stripe" ならカード払いのときだけ、"instore" なら
// 受け取り払いのときだけ効く（promotionRules の isPaymentAllowed）。
// null は「絞らない」——Firestore では値の無い null をそう置く。
export type PaymentRestriction = "stripe" | "instore" | null;

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
