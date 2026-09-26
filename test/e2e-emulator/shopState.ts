// 店舗側の設定を、画面を通さず Firestore へ直に置く。画面から変えると管理画面の
// 一覧や Stripe の連携まで巻き込むので、見たいものだけを動かせるようにする。
// エミュレーターは owner を名乗る要求を管理権限として扱い、規則を通さない。
import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import {
  SEED_DELIVERY_RESTAURANT_ID,
  SEED_MENU_ID,
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
