import { stripe_regions_jp } from "../src/config/constant.ts";

// e2e がエミュレーターへ入れる中身。輸入しても何も起きない（副作用なし）。
// 形は src/utils/admin/shopInfoForm.ts の初期値に合わせてある。ずれると
// 受取時刻の組み立てが undefined を踏んで画面ごと落ちる。
// Firestore の自動 id は英数字だけ。functions 側の validateFirebaseId が
// /^[a-zA-Z0-9]+$/ を要求するので、ハイフンを入れると注文の検証で弾かれる。
export const SEED_RESTAURANT_ID = "e2erestaurant";
export const SEED_OWNER_UID = "e2eowner";
// 管理画面は「メール認証されていれば店舗オーナー」という作り（store/user.ts の
// isAdmin）。所有は店舗の uid が一致するかで決まるので、uid を指定して作る。
export const SEED_OWNER_EMAIL = "e2e-owner@example.com";
export const SEED_OWNER_PASSWORD = "e2e-password-1234";
export const SEED_RESTAURANT_NAME = "E2E テスト食堂";
// 注文者。画面は国番号を前に足すだけなので、先頭の 0 は残ったまま送られる。
// uid を決めておくと、Stripe の顧客 id を先に置いておける（下記）。
export const SEED_CUSTOMER_UID = "e2ecustomer";
export const SEED_CUSTOMER_PHONE_INPUT = "09012345678";
export const SEED_CUSTOMER_PHONE =
  stripe_regions_jp.countries[0].code + SEED_CUSTOMER_PHONE_INPUT;
// orderCreated は注文のたびに createCustomer を通る。/users/:uid/system/stripe が
// 無いと本物の Stripe API へ顧客を作りに行くので、先に置いて通らせない。
export const SEED_CUSTOMER_STRIPE_ID = "cus_e2e";
// 値引き。閾値をほかの試験の注文より高くしてあるので、ここ以外には効かない。
export const SEED_PROMOTION_ID = "e2ediscount";
export const SEED_PROMOTION_NAME = "E2E 値引き";
export const SEED_PROMOTION_THRESHOLD = 2000;
export const SEED_PROMOTION_DISCOUNT = 100;

// 期間は「いま」を必ず含む固定の幅にする。相対で置くと、走らせた時刻で結果が変わる。
const PROMOTION_TERM_FROM = new Date("2020-01-01T00:00:00Z");
const PROMOTION_TERM_TO = new Date("2099-12-31T00:00:00Z");

export const seedPromotion = () => ({
  promotionId: SEED_PROMOTION_ID,
  promotionName: SEED_PROMOTION_NAME,
  enable: true,
  type: "discount",
  hasTerm: true,
  termFrom: PROMOTION_TERM_FROM,
  termTo: PROMOTION_TERM_TO,
  discountThreshold: SEED_PROMOTION_THRESHOLD,
  discountMethod: "amount",
  discountValue: SEED_PROMOTION_DISCOUNT,
  // 支払い方法で絞らない。受け取り払いでも効く。
  paymentRestrictions: null,
  usageRestrictions: false,
});

// 保存を伴う試験のための、別のオーナーと店舗。**同じ店舗を書き換えると
// ほかの試験の前提が変わる。** オーナーごと分けておけば管理画面の一覧も混ざらない。
export const SEED_EDIT_OWNER_UID = "e2eeditowner";
export const SEED_EDIT_OWNER_EMAIL = "e2e-edit-owner@example.com";
export const SEED_EDIT_OWNER_PASSWORD = "e2e-edit-password-1234";
export const SEED_EDIT_RESTAURANT_ID = "e2eeditshop";
export const SEED_EDIT_RESTAURANT_NAME = "E2E 編集用食堂";
export const SEED_EDIT_MENU_ID = "e2eeditmenu";
export const SEED_EDIT_MENU_NAME = "編集用ランチ";
export const SEED_EDIT_MENU_PRICE = 500;

// 配送条件の試験のための店舗。**税を 0 にしてある** — 判定表の境目（999 / 1000 /
// 2000）は「注文金額」で書かれており、税が乗ると境目がずれて何を測ったか分からなくなる。
export const SEED_DELIVERY_OWNER_UID = "e2edeliveryowner";
export const SEED_DELIVERY_OWNER_EMAIL = "e2e-delivery-owner@example.com";
export const SEED_DELIVERY_OWNER_PASSWORD = "e2e-delivery-password-1234";
export const SEED_DELIVERY_RESTAURANT_ID = "e2edeliveryshop";
export const SEED_DELIVERY_RESTAURANT_NAME = "E2E 配達食堂";
// 判定表の境目に合わせた二品。999 だけでは受け付けず、1000 で受け付け、
// 二つで 2000 になって配達無料になる。
export const SEED_DELIVERY_UNDER_MENU_ID = "e2edeliveryunder";
export const SEED_DELIVERY_UNDER_MENU_NAME = "境目未満弁当";
export const SEED_DELIVERY_UNDER_PRICE = 999;
export const SEED_DELIVERY_MENU_ID = "e2edeliverymenu";
export const SEED_DELIVERY_MENU_NAME = "配達弁当";
export const SEED_DELIVERY_MENU_PRICE = 1000;
// 配送条件（管理画面の宅配設定と同じ形）。
export const SEED_DELIVERY_THRESHOLD = 1000;
export const SEED_DELIVERY_FEE = 500;
export const SEED_DELIVERY_FREE_THRESHOLD = 2000;

export const SEED_MENU_ID = "e2emenu";
export const SEED_MENU_NAME = "から揚げ定食";
export const SEED_MENU_PRICE = 800;
export const SEED_FOOD_TAX_PERCENT = 8;

// 営業時間は 0 時からの分で持つ。
const MINUTES_PER_HOUR = 60;
const OPEN_HOUR = 11;
const CLOSE_HOUR = 21;

const everyDay = <T>(value: () => T) =>
  [1, 2, 3, 4, 5, 6, 7].reduce<{ [key: number]: T }>((days, day) => {
    days[day] = value();
    return days;
  }, {});

// 管理画面の一覧は orderBy("createdAt") で引く。Firestore は並べ替えの鍵を持たない
// 文書を結果から落とすので、これが無いと店舗が一件も出ない。
export const seedRestaurant = (createdAt: Date) => ({
  createdAt,
  // RestaurantWrapper のテンプレートが shopInfo.restaurantId を見て描き分けるので、
  // 文書の id とは別に属性としても要る。
  restaurantId: SEED_RESTAURANT_ID,
  restaurantName: SEED_RESTAURANT_NAME,
  // 必須の欄。**空だと店情報の変更画面で「保存」が死ぬ** — 画面の初期値は "" で、
  // 種に無い欄はそのまま未入力として扱われる。
  ownerName: "店長 花子",
  // 品物の並び順。ここに id が無い品物は画面に出ない。
  menuLists: [SEED_MENU_ID, SEED_OPTION_MENU_ID],
  uid: SEED_OWNER_UID,
  publicFlag: true,
  deletedFlag: false,
  supportLiff: false,
  isEC: false,
  enableDelivery: false,
  onlyTakeout: true,
  streetAddress: "1-1-1",
  city: "テスト市",
  state: "東京都",
  zip: "1000001",
  phoneNumber: "0312345678",
  countryCode: "+81",
  introduction: "e2e 用の店舗です。",
  businessDay: everyDay(() => true),
  openTimes: everyDay(() => [
    { start: OPEN_HOUR * MINUTES_PER_HOUR, end: CLOSE_HOUR * MINUTES_PER_HOUR },
  ]),
  foodTax: SEED_FOOD_TAX_PERCENT,
  alcoholTax: 10,
  inclusiveTax: false,
  pickUpMinimumCookTime: 25,
  pickUpDaysInAdvance: 3,
  temporaryClosure: [],
  category1: [],
  category2: [],
  images: {},
});

// 選択肢は「名前(+100)」の形。組の中がカンマ区切りで1つならチェック欄、
// 複数ならラジオ。src/utils/commonUtils.ts の読み方に合わせてある。
export const SEED_OPTION_MENU_ID = "e2emenuoptions";
export const SEED_OPTION_MENU_NAME = "オプション付き弁当";
export const SEED_OPTION_MENU_PRICE = 1000;
export const SEED_CHECKBOX_OPTION = "大盛り(+100)";
export const SEED_CHECKBOX_OPTION_PRICE = 100;
export const SEED_RADIO_OPTIONS = "温(+0),冷(+50)";
export const SEED_RADIO_SECOND_PRICE = 50;

export const seedOptionMenu = () => ({
  ...seedMenu(),
  itemName: SEED_OPTION_MENU_NAME,
  itemDescription: "選択肢の試験用",
  price: SEED_OPTION_MENU_PRICE,
  itemOptionCheckbox: [SEED_CHECKBOX_OPTION, SEED_RADIO_OPTIONS],
});

export const seedMenu = () => ({
  itemName: SEED_MENU_NAME,
  itemAliasesName: "",
  // orderCreated が menuItems へ写すので、undefined だと Firestore が書き込みを拒む。
  itemPhoto: "",
  category1: "",
  category2: "",
  itemDescription: "から揚げと白飯",
  price: SEED_MENU_PRICE,
  tax: "food",
  publicFlag: true,
  deletedFlag: false,
  soldOut: false,
  uid: SEED_OWNER_UID,
  itemOptionCheckbox: [],
  images: {},
});

// 1x1 の透明な点。画像は**未設定だと公開店舗の保存が止まる**（shopInfoForm の
// restProfilePhoto / restCoverPhoto）。網に出さずに置けるよう、埋め込みで持つ。
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const seedEditRestaurant = (createdAt: Date) => ({
  ...seedRestaurant(createdAt),
  restProfilePhoto: TRANSPARENT_PIXEL,
  restCoverPhoto: TRANSPARENT_PIXEL,
  restaurantId: SEED_EDIT_RESTAURANT_ID,
  restaurantName: SEED_EDIT_RESTAURANT_NAME,
  menuLists: [SEED_EDIT_MENU_ID],
  uid: SEED_EDIT_OWNER_UID,
});

export const seedEditMenu = () => ({
  ...seedMenu(),
  itemName: SEED_EDIT_MENU_NAME,
  itemDescription: "保存の試験用",
  price: SEED_EDIT_MENU_PRICE,
  uid: SEED_EDIT_OWNER_UID,
});

export const seedDeliveryRestaurant = (createdAt: Date) => ({
  ...seedRestaurant(createdAt),
  restaurantId: SEED_DELIVERY_RESTAURANT_ID,
  restaurantName: SEED_DELIVERY_RESTAURANT_NAME,
  menuLists: [SEED_DELIVERY_MENU_ID, SEED_DELIVERY_UNDER_MENU_ID],
  uid: SEED_DELIVERY_OWNER_UID,
  enableDelivery: true,
  deliveryOnlyStore: false,
  deliveryMinimumCookTime: 60,
  onlyTakeout: false,
  foodTax: 0,
  alcoholTax: 0,
});

// 配達の範囲は地図で描かせない。確認画面が Google の地図を待つと、
// 見たいのは金額なのにそこで止まる。
export const seedDeliveryArea = () => ({
  enableAreaMap: false,
  enableAreaText: false,
  radius: 500,
  areaText: "",
  enableDeliveryFree: true,
  deliveryFreeThreshold: SEED_DELIVERY_FREE_THRESHOLD,
  enableDeliveryThreshold: true,
  deliveryThreshold: SEED_DELIVERY_THRESHOLD,
  deliveryFee: SEED_DELIVERY_FEE,
  uid: SEED_DELIVERY_OWNER_UID,
});

export const seedDeliveryMenu = () => ({
  ...seedMenu(),
  itemName: SEED_DELIVERY_MENU_NAME,
  itemDescription: "配達の試験用",
  price: SEED_DELIVERY_MENU_PRICE,
  uid: SEED_DELIVERY_OWNER_UID,
});

export const seedDeliveryUnderMenu = () => ({
  ...seedMenu(),
  itemName: SEED_DELIVERY_UNDER_MENU_NAME,
  itemDescription: "配達の試験用（境目未満）",
  price: SEED_DELIVERY_UNDER_PRICE,
  uid: SEED_DELIVERY_OWNER_UID,
});
