export const order_status: { [key: string]: number } = {
  error: 0,
  new_order: 100, // by user
  validation_ok: 200, // by functions
  order_placed: 300, // by user and stripe
  order_accepted: 400, // by restaurant
  cooking_completed: 500, // by restaurant (obsolete)
  ready_to_pickup: 600, // by restaurant and stripe
  transaction_complete: 650, // by restaurant (optional)
  order_canceled: 700, // by restaurant or user
  order_refunded: 800, // by restaurant
  transaction_hide: 1000, // special status
};

export const order_status_for_form: { [key: string]: number } = {
  error: 0,
  order_placed: 300, // by user and stripe
  order_accepted: 400, // by restaurant
  ready_to_pickup: 600, // by restaurant and stripe
  transaction_complete: 650, // by restaurant (optional)
  order_canceled: 700, // by restaurant or user
};

export const order_status_keys = Object.keys(order_status).reduce(
  (tmp: { [key: string]: string }, key: string) => {
    tmp[String(order_status[key])] = key;
    return tmp;
  },
  {},
);

export const possible_transitions = {
  [order_status.order_placed]: {
    [order_status.order_accepted]: true,
    [order_status.order_canceled]: true,
  },
  [order_status.order_accepted]: {
    [order_status.order_canceled]: true,
    [order_status.ready_to_pickup]: true, // both paid and unpaid
  },
  [order_status.ready_to_pickup]: {
    [order_status.order_refunded]: true,
    [order_status.transaction_complete]: true,
  },
  [order_status.transaction_complete]: {
    [order_status.transaction_hide]: true,
  },
};

export const next_transitions = {
  [order_status.order_placed]: order_status.order_accepted,
  [order_status.order_accepted]: order_status.ready_to_pickup,
  [order_status.ready_to_pickup]: order_status.transaction_complete,
  [order_status.transaction_complete]: order_status.transaction_hide,
};

export const order_error = {
  validation_error: 100,
  order_canceled_by_customer: 200,
  payment_error: 300,
  order_canceled_by_restaurant: 400,
  unknow_error: 900,
};

export const timeEventMapping = {
  order_placed: "orderPlacedAt",
  order_accepted: "orderAcceptedAt",
  cooking_completed: "orderCookingCompletedAt", // obsolete
  ready_to_pickup: "timeConfirmed",
  order_canceled_by_restaurant: "orderRestaurantCanceledAt",
  order_canceled_by_customer: "orderCustomerCanceledAt",
  transaction_complete: "transactionCompletedAt",
  transaction_hide: "transactionHideAt", // special condition
};

export const stripe_regions: { [key: string]: any } = {
  US: {
    langs: ["en", "es"], // first one is default
    currency: "USD",
    multiple: 100,
    hidePostalCode: false,
    tip: {
      default: 15,
      max: 100,
      choices: [10, 15, 18, 20],
    },
    countries: [{ code: "+1", name: "sms.country.US" }],
    allergens: [
      "gluten",
      "crustacean",
      "egg",
      "milk",
      "fish",
      "peanuts",
      "soybeans",
      "shellfish",
      "raw",
    ],
  },
  JP: {
    langs: ["ja"],
    currency: "JPY",
    multiple: 1,
    tip: {
      default: 0,
      max: 30,
      choices: [0, 5, 10, 20],
    },
    countries: [{ code: "+81", name: "sms.country.JP" }],
    hidePostalCode: true,
    allergens: ["shrimp", "crab", "gluten", "soba", "egg", "milk", "peanuts"],
  },
};

export const daysOfWeek = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
};

export const USStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export const JPPrefecture = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

export const taxRates = ["food", "alcohol"];

export const reservationTheDayBefore = [
  { messageKey: "editRestaurant.reservationTheDaysBefore.zero", value: 0 },
  { messageKey: "editRestaurant.reservationTheDaysBefore.one", value: 1 },
  { messageKey: "editRestaurant.reservationTheDaysBefore.two", value: 2 },
  { messageKey: "editRestaurant.reservationTheDaysBefore.three", value: 3 },
  { messageKey: "editRestaurant.reservationTheDaysBefore.four", value: 4 },
  { messageKey: "editRestaurant.reservationTheDaysBefore.five", value: 5 },
  { messageKey: "editRestaurant.reservationTheDaysBefore.six", value: 6 },
  { messageKey: "editRestaurant.reservationTheDaysBefore.seven", value: 7 },
  { messageKey: "editRestaurant.reservationTheDaysBefore.twoWeeks", value: 14 },
  {
    messageKey: "editRestaurant.reservationTheDaysBefore.threeWeeks",
    value: 21,
  },
  {
    messageKey: "editRestaurant.reservationTheDaysBefore.twoMonths",
    value: 60,
  },
  {
    messageKey: "editRestaurant.reservationTheDaysBefore.threeMonths",
    value: 90,
  },
];

export const minimumCookTimeChoices = [
  { messageKey: "editRestaurant.minimumCookTime.halfHour", value: 30 },
  { messageKey: "editRestaurant.minimumCookTime.oneHour", value: 60 },
  { messageKey: "editRestaurant.minimumCookTime.twoHours", value: 120 },
  { messageKey: "editRestaurant.minimumCookTime.oneDay", value: 60 * 24 },
  { messageKey: "editRestaurant.minimumCookTime.twoDays", value: 60 * 24 * 2 },
  {
    messageKey: "editRestaurant.minimumCookTime.threeDays",
    value: 60 * 24 * 3,
  },
  { messageKey: "editRestaurant.minimumCookTime.fourDays", value: 60 * 24 * 4 },
  { messageKey: "editRestaurant.minimumCookTime.fiveDays", value: 60 * 24 * 5 },
  { messageKey: "editRestaurant.minimumCookTime.sixDays", value: 60 * 24 * 6 },
];

export const paymentMethods = [
  { key: "cache" },
  { key: "suica" },
  { key: "creditCard" },
  { key: "paypay" },
  { key: "dpay" },
  { key: "rpay" },
  { key: "id" },
  { key: "quick" },
  { key: "applepay" },
  { key: "line" },
  { key: "merpay" },
  { key: "aupay" },
  { key: "alipay" },
  { key: "wechatpay" },
  { key: "unipay" },
];

export const regionalSettings = {
  US: {
    CurrencyKey: "USD",
    StateKey: "shopInfo.state",
    AddressStates: USStates,
    Logo: "OwnPlate-Logo-Horizontal-YellowBlack.svg",
    Logo2: "OwnPlate-Logo-Stack-YellowBlack.svg",
    FeatureHeroMobile: {
      ja: "Feature-Hero-Mobile-ja.svg",
      en: "Feature-Hero-Mobile-en.svg",
    },
    FeatureHeroTablet: {
      ja: "Feature-Hero-Tablet-ja.svg",
      en: "Feature-Hero-Tablet-en.svg",
    },
    FeatureHero: {
      ja: "Feature-Hero-v01-ja.svg",
      en: "Feature-Hero-v01-en.svg",
    },
    requireTaxInput: true,
    requireTaxPriceDisplay: false,
    taxRateKeys: {
      food: "food",
      alcohol: "alcohol",
    },
    defaultLanguage: "en",
    languages: {
      en: "English (US)",
      es: "Español",
      ja: "日本語",
    },
    covid19trace: false,
    hashTag: "ownplate",
  },
  JP: {
    CurrencyKey: "JPY",
    StateKey: "shopInfo.prefecture",
    AddressStates: JPPrefecture,
    Logo: "Omochikaeri-Logo-Horizontal-Primary.png",
    Logo2: "Omochikaeri-Logo-Stack-Primary.png",
    FeatureHeroMobile: {
      ja: "Feature-Hero-Mobile-ja.svg",
      en: "Feature-Hero-Mobile-en.svg",
    },
    FeatureHeroTablet: {
      ja: "Feature-Hero-Tablet-ja.svg",
      en: "Feature-Hero-Tablet-en.svg",
    },
    FeatureHero: {
      ja: "Feature-Hero-v01-ja.svg",
      en: "Feature-Hero-v01-en.svg",
    },
    requireTaxInput: false,
    requireTaxPriceDisplay: true,
    defaultTax: {
      foodTax: 8,
      alcoholTax: 10,
    },
    taxRateKeys: {
      food: "foodJP",
      alcohol: "alcoholJP",
    },
    defaultLanguage: "ja",
    languages: {
      ja: "日本語",
      en: "English (US)",
      fr: "French",
    },
    covid19trace: true,
    hashTag: "omochikaeri",
  },
};

export const soundFiles = [
  {
    nameKey: "admin.sound.default",
    file: "/sound_default.mp3",
  },
  {
    nameKey: "admin.sound.gong",
    file: "/sound_gong.mp3",
  },
  {
    nameKey: "admin.sound.magic",
    file: "/sound_magic.mp3",
  },
  {
    nameKey: "admin.sound.doorChime",
    file: "/sound_door_chime.mp3",
  },
  {
    nameKey: "admin.sound.coin",
    file: "/sound_coin.mp3",
  },
  {
    nameKey: "admin.sound.cheepCheep",
    file: "/sound_cheep_cheep.mp3",
  },
  {
    nameKey: "admin.sound.meow",
    file: "/sound_meow.mp3",
  },
];

export const placedCancelReasons = [
  {
    message: "キャンセル理由を必ず選択してください",
    key: "",
  },
  {
    message: "店頭在庫無し",
    key: "placedNoStock",
  },
  {
    message: "発注しないと店舗で判断",
    key: "placedNoOrder",
  },
  {
    message: "緊急取消のため発注不可",
    key: "placedEmergency",
  },
  {
    message: "お客様申し出",
    key: "placedByCustomer",
  },
  {
    message: "テスト注文のため",
    key: "placedTest",
  },
];

export const acceptedCancelReasons = [
  {
    message: "キャンセル理由を必ず選択してください",
    key: "",
  },
  {
    message: "商品不良",
    key: "acceptedBadCondition",
  },
  {
    message: "発注漏れ",
    key: "acceptedNoOrder",
  },
  {
    message: "商品未納",
    key: "acceptedNoStock",
  },
  {
    message: "お客様申し出",
    key: "acceptedByCustomer",
  },
  {
    message: "テスト注文のため",
    key: "acceptedTest",
  },
];

export const partners = [
  {
    id: "singularitysociety",
    name: "シンギュラリティ・ソサイエティ",
    logo: "singularitysociety.png",
    ask: false,
  },
  {
    id: "legssystem",
    name: "【おもちかえり.com × LEGSsystem】",
    logo: "legssystem.png",
    ask: true,
  },
];

export const toBeOrNotSelect = [
  { value: true, message: "あり", messageKey: "yes" },
  { value: false, message: "なし", messageKey: "no" },
];
export const toBeOrNotSelect2 = [
  { value: true, message: "あり(1回)", messageKey: "yesOnce" },
  { value: false, message: "なし", messageKey: "no" },
];
export const yesOrNoSelect = [
  { value: true, message: "Yes" },
  { value: false, message: "No" },
];
export const discountMethodSelect = [
  { value: "amount", messageKey: "amount" },
  { value: "ratio", messageKey: "ratio" },
];
export const discountTypeSelect = [
  { value: "discount", messageKey: "discount" },
  // { value: 'onetimeCoupon', messageKey: 'onetimeCoupon' },
  // { value: 'multipletimesCoupon', messageKey: 'multipletimesCoupon' }
];
export const promotionPaymentRestrictionsSelect = [
  { value: "stripe", message: "事前カード決済" },
  { value: "instore", message: "受け取り払い" },
  { value: null, message: "なし" },
];

export const twiml_neworder =
  "<Response><Say language=\"ja-jp\">こんにちは。わたしは、おもちかえりどっとこむです。あたらしいオーダーが入りました。かくにんをよろしくおねがいいたします。おもちかえりどっとこむでした。</Say></Response>";

export const timeList = [
  null,
  "00:00 AM",
  "00:30 AM",
  "01:00 AM",
  "01:30 AM",
  "02:00 AM",
  "02:30 AM",
  "03:00 AM",
  "03:30 AM",
  "04:00 AM",
  "04:30 AM",
  "05:00 AM",
  "05:30 AM",
  "06:00 AM",
  "06:30 AM",
  "07:00 AM",
  "07:30 AM",
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
  "12:00 AM",
];

export const timeList2 = [
  null,
  "00:00 AM",
  "00:10 AM",
  "00:20 AM",
  "00:30 AM",
  "00:40 AM",
  "00:50 AM",
  "01:00 AM",
  "01:10 AM",
  "01:20 AM",
  "01:30 AM",
  "01:40 AM",
  "01:50 AM",
  "02:00 AM",
  "02:10 AM",
  "02:20 AM",
  "02:30 AM",
  "02:40 AM",
  "02:50 AM",
  "03:00 AM",
  "03:10 AM",
  "03:20 AM",
  "03:30 AM",
  "03:40 AM",
  "03:50 AM",
  "04:00 AM",
  "04:10 AM",
  "04:20 AM",
  "04:30 AM",
  "04:40 AM",
  "04:50 AM",
  "05:00 AM",
  "05:10 AM",
  "05:20 AM",
  "05:30 AM",
  "05:40 AM",
  "05:50 AM",
  "06:00 AM",
  "06:10 AM",
  "06:20 AM",
  "06:30 AM",
  "06:40 AM",
  "06:50 AM",
  "07:00 AM",
  "07:10 AM",
  "07:20 AM",
  "07:30 AM",
  "07:40 AM",
  "07:50 AM",
  "08:00 AM",
  "08:10 AM",
  "08:20 AM",
  "08:30 AM",
  "08:40 AM",
  "08:50 AM",
  "09:00 AM",
  "09:10 AM",
  "09:20 AM",
  "09:30 AM",
  "09:40 AM",
  "09:50 AM",
  "10:00 AM",
  "10:10 AM",
  "10:20 AM",
  "10:30 AM",
  "10:40 AM",
  "10:50 AM",
  "11:00 AM",
  "11:10 AM",
  "11:20 AM",
  "11:30 AM",
  "11:40 AM",
  "11:50 AM",
  "12:00 PM",
  "12:10 PM",
  "12:20 PM",
  "12:30 PM",
  "12:40 PM",
  "12:50 PM",
  "01:00 PM",
  "01:10 PM",
  "01:20 PM",
  "01:30 PM",
  "01:40 PM",
  "01:50 PM",
  "02:00 PM",
  "02:10 PM",
  "02:20 PM",
  "02:30 PM",
  "02:40 PM",
  "02:50 PM",
  "03:00 PM",
  "03:10 PM",
  "03:20 PM",
  "03:30 PM",
  "03:40 PM",
  "03:50 PM",
  "04:00 PM",
  "04:10 PM",
  "04:20 PM",
  "04:30 PM",
  "04:40 PM",
  "04:50 PM",
  "05:00 PM",
  "05:10 PM",
  "05:20 PM",
  "05:30 PM",
  "05:40 PM",
  "05:50 PM",
  "06:00 PM",
  "06:10 PM",
  "06:20 PM",
  "06:30 PM",
  "06:40 PM",
  "06:50 PM",
  "07:00 PM",
  "07:10 PM",
  "07:20 PM",
  "07:30 PM",
  "07:40 PM",
  "07:50 PM",
  "08:00 PM",
  "08:10 PM",
  "08:20 PM",
  "08:30 PM",
  "08:40 PM",
  "08:50 PM",
  "09:00 PM",
  "09:10 PM",
  "09:20 PM",
  "09:30 PM",
  "09:40 PM",
  "09:50 PM",
  "10:00 PM",
  "10:10 PM",
  "10:20 PM",
  "10:30 PM",
  "10:40 PM",
  "10:50 PM",
  "11:00 PM",
  "11:10 PM",
  "11:20 PM",
  "11:30 PM",
  "11:40 PM",
  "11:50 PM",
  "12:00 AM",
];
