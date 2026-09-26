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
