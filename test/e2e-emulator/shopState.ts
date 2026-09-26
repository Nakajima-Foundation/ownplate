// 店舗側の設定を、画面を通さず Firestore へ直に置く。画面から変えると管理画面の
// 一覧や Stripe の連携まで巻き込むので、見たいものだけを動かせるようにする。
// エミュレーターは owner を名乗る要求を管理権限として扱い、規則を通さない。
import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import {
  SEED_MENU_ID,
  SEED_OPEN_TIME,
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
