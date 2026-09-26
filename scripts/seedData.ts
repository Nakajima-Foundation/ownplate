// e2e がエミュレーターへ入れる中身。輸入しても何も起きない（副作用なし）。
// 形は src/utils/admin/shopInfoForm.ts の初期値に合わせてある。ずれると
// 受取時刻の組み立てが undefined を踏んで画面ごと落ちる。
export const SEED_RESTAURANT_ID = "e2e-restaurant";
export const SEED_OWNER_UID = "e2e-owner";
export const SEED_RESTAURANT_NAME = "E2E テスト食堂";
export const SEED_MENU_ID = "e2e-menu";
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

export const seedRestaurant = () => ({
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
export const SEED_OPTION_MENU_ID = "e2e-menu-options";
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
