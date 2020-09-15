export const order_status = {
  error: 0,
  new_order: 100, // by user
  validation_ok: 200, // by functions
  order_placed: 300, // by user and stripe
  order_accepted: 400, // by restaurant
  cooking_completed: 500, // by restaurant (obsolete)
  ready_to_pickup: 600, // by restaurant and stripe
  transaction_complete: 650, // by restaurant (optional)
  order_canceled: 700, // by restaurant or user
  order_refunded: 800 // by restaurant
};

export const possible_transitions = {
  [order_status.order_placed]: {
    [order_status.order_accepted]: true,
    [order_status.order_canceled]: true
  },
  [order_status.order_accepted]: {
    [order_status.order_canceled]: true,
    [order_status.ready_to_pickup]: true // both paid and unpaid
  },
  [order_status.ready_to_pickup]: {
    [order_status.order_refunded]: true,
    [order_status.transaction_complete]: true
  }
};

export const order_error = {
  validation_error: 100,
  order_canceled_by_customer: 200,
  payment_error: 300,
  order_canceled_by_restaurant: 400,
  unknow_error: 900
};

export const stripe_regions = {
  US: {
    langs: ["en", "es"], // first one is default
    currency: "USD",
    multiple: 100,
    hidePostalCode: false,
    tip: {
      default: 15,
      max: 100,
      choices: [10, 15, 18, 20]
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
      "raw"
    ]
  },
  EU: {
    langs: ["en", "fr", "es", "it", "de", "nl"],
    currency: "EUR",
    multiple: 100,
    hidePostalCode: false,
    tip: {
      default: 15,
      max: 100,
      choices: [10, 15, 18, 20]
    },
    countries: [
      { code: "+44", name: "sms.country.UK" },
      { code: "+33", name: "sms.country.FR" },
      { code: "+34", name: "sms.country.ES" },
      { code: "+49", name: "sms.country.DE" }
    ],
    allergens: ["gluten", "crustacean", "egg", "milk", "lupin", "mollusc"]
  },
  JP: {
    langs: ["ja"],
    currency: "JPY",
    multiple: 1,
    tip: {
      default: 0,
      max: 30,
      choices: [0, 5, 10, 20]
    },
    countries: [{ code: "+81", name: "sms.country.JP" }],
    hidePostalCode: true,
    allergens: ["shrimp", "crab", "gluten", "soba", "egg", "milk", "peanuts"]
  }
};

export const daysOfWeek = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday"
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
  "Wyoming"
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
  "沖縄県"
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
  { messageKey: "editRestaurant.reservationTheDaysBefore.threeWeeks", value: 21 }
];

export const minimumCookTimeChoices = [
  { messageKey: "editRestaurant.minimumCookTime.halfHour", value: 30 },
  { messageKey: "editRestaurant.minimumCookTime.oneHour", value: 60 },
  { messageKey: "editRestaurant.minimumCookTime.twoHours", value: 120 },
  { messageKey: "editRestaurant.minimumCookTime.oneDay", value: 60 * 24 },
  { messageKey: "editRestaurant.minimumCookTime.twoDays", value: 60 * 24 * 2 },
  { messageKey: "editRestaurant.minimumCookTime.threeDays", value: 60 * 24 * 3 },
  { messageKey: "editRestaurant.minimumCookTime.fourDays", value: 60 * 24 * 4 },
  { messageKey: "editRestaurant.minimumCookTime.fiveDays", value: 60 * 24 * 5 },
  { messageKey: "editRestaurant.minimumCookTime.sixDays", value: 60 * 24 * 6 }
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
      en: "Feature-Hero-Mobile-en.svg"
    },
    FeatureHeroTablet: {
      ja: "Feature-Hero-Tablet-ja.svg",
      en: "Feature-Hero-Tablet-en.svg"
    },
    FeatureHero: {
      ja: "Feature-Hero-v01-ja.svg",
      en: "Feature-Hero-v01-en.svg"
    },
    requireTaxInput: true,
    requireTaxPriceDisplay: false,
    taxRateKeys: {
      food: "food",
      alcohol: "alcohol"
    },
    defaultLanguage: "en",
    languages: {
      en: "English (US)",
      es: "Español",
      ja: "日本語"
    },
    covid19trace: false,
    hashTag: "ownplate",
  },
  JP: {
    CurrencyKey: "JPY",
    StateKey: "shopInfo.prefecture",
    AddressStates: JPPrefecture,
    Logo: "Omochikaeri-Logo-Horizontal-YellowBlack.svg",
    Logo2: "Omochikaeri-Logo-Stack-YellowBlack.svg",
    FeatureHeroMobile: {
      ja: "Feature-Hero-Mobile-ja.svg",
      en: "Feature-Hero-Mobile-en.svg"
    },
    FeatureHeroTablet: {
      ja: "Feature-Hero-Tablet-ja.svg",
      en: "Feature-Hero-Tablet-en.svg"
    },
    FeatureHero: {
      ja: "Feature-Hero-v01-ja.svg",
      en: "Feature-Hero-v01-en.svg"
    },
    requireTaxInput: false,
    requireTaxPriceDisplay: true,
    defaultTax: {
      foodTax: 8,
      alcoholTax: 10
    },
    taxRateKeys: {
      food: "foodJP",
      alcohol: "alcoholJP"
    },
    defaultLanguage: "ja",
    languages: {
      ja: "日本語",
      en: "English (US)"
    },
    covid19trace: true,
    hashTag: "omochikaeri",
  },
  EU: {
    CurrencyKey: "EUR",
    StateKey: "shopInfo.state",
    AddressStates: null,
    Logo: "OwnPlate-Logo-Horizontal-YellowBlack.svg",
    Logo2: "OwnPlate-Logo-Stack-YellowBlack.svg",
    FeatureHeroMobile: {
      ja: "Feature-Hero-Mobile-ja.svg",
      en: "Feature-Hero-Mobile-en.svg"
    },
    FeatureHeroTablet: {
      ja: "Feature-Hero-Tablet-ja.svg",
      en: "Feature-Hero-Tablet-en.svg"
    },
    FeatureHero: {
      ja: "Feature-Hero-v01-ja.svg",
      en: "Feature-Hero-v01-en.svg"
    },
    requireTaxInput: true,
    requireTaxPriceDisplay: false,
    taxRateKeys: {
      food: "food",
      alcohol: "alcohol"
    },
    defaultLanguage: "en",
    languages: {
      en: "English (US)",
      es: "Español",
      de: "Deutsch",
      fr: "Le français",
      it: "italiano",
      nl: "Nederlands",
      ja: "日本語"
    },
    covid19trace: false,
    hashTag: "ownplate",
  }
};

export const soundFiles = [
  {
    nameKey: "admin.sound.default",
    file: "/sound_default.mp3"
  },
  {
    nameKey: "admin.sound.gong",
    file: "/sound_gong.mp3"
  },
  {
    nameKey: "admin.sound.magic",
    file: "/sound_magic.mp3"
  },
  {
    nameKey: "admin.sound.doorChime",
    file: "/sound_door_chime.mp3"
  },
  {
    nameKey: "admin.sound.coin",
    file: "/sound_coin.mp3"
  },
  {
    nameKey: "admin.sound.cheepCheep",
    file: "/sound_cheep_cheep.mp3"
  },
  {
    nameKey: "admin.sound.meow",
    file: "/sound_meow.mp3"
  }
];

export const twiml_neworder = '<Response><Say language="ja-jp">こんにちは。わたしは、おもちかえりどっとこむです。あたらしいオーダーが入りました。かくにんをよろしくおねがいいたします。</Say></Response>';
