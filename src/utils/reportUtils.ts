const reportHeadersTop = [
  "name",
  "restaurantName",
  "type",
  "statusName",
  "userName",
];
const reportHeadersTopMo = [
  "name",
  "restaurantName",
  "type",
  "statusName",
  "userName",
];
const reportHeadersTime = [
  "datePlaced",
  "dateAccepted",
  "dateConfirmed",
  "dateCompleted",
  "timeRequested",
  "timeToPickup",
];

const reportHeadersItem = ["itemName", "options", "category1", "category2"];

export const reportHeaders = [
  ...reportHeadersTop,
  "phoneNumber",
  ...reportHeadersTime,

  ...reportHeadersItem,
  "count",
  "total",
  "payment",
  "memo",
];
export const reportHeadersForMo = [
  ...reportHeadersTopMo,
  // "phoneNumber",
  "restaurantId",
  "shopId",
  "uid",

  ...reportHeadersTime,

  "itemName",
  // ...reportHeadersItem,

  "productId",
  "category",
  "categoryId",
  "subCategory",
  "subCategoryId",

  // for mo
  "menuPrice",
  "taxRate",
  "tax",
  // end for mo

  "count",

  "productSubTotal",
  "total",
  "payment",
  "orderId",
  "memo",

  // for mo 2023
  "discountPrice",
  "beforeDiscountPrice",
  "cancelReason",
  
];
export const reportHeadersWithAddress = [
  ...reportHeadersTop,

  "ec.name",
  "ec.zip",
  "ec.prefecture",
  "ec.address",
  "ec.email",

  "phoneNumber",

  ...reportHeadersTime,

  ...reportHeadersItem,
  "count",
  "total",
  "shippingCost",
  "payment",
  "memo",
];

/* ---- */

export const revenueCSVHeader = [
  "date",
  "type",
  "restaurantName",
  "orderStatus",
  "foodRevenue",
  "foodTax",
  "alcoholRevenue",
  "salesTax",
  "productSubTotal",
  "tipShort",
  "serviceTax",
  "shippingCost",
  "total",
  "totalCount",
  "name",
  "payment",
];

// for csv
export const revenueMoCSVHeader = [
  "date",
  "type",
  "restaurantId",
  "shopId",
  "restaurantName",
  "orderStatus",
  "foodRevenue",
  "foodTax",
  "alcoholRevenue",
  "salesTax",
  "total",
  "name",
  "payment",

  // for mo 2023
  "discountPrice",
  "beforeDiscountPrice",
  "cancelReason",

];

// for table
export const revenueTableHeader = [
  "date",
  "foodRevenue",
  "foodTax",
  "alcoholRevenue",
  "salesTax",
  "productSubTotal",
  "tipShort",
  "serviceTax",
  "shippingCost",
  "total",
  "name",
];


// for download component
export const downloadFields = [
  "datePlaced",
  "type",
  "dateEstimated",
  "dateConfirmed",
  "statusName",
  "totalCount",
  "total",
  "phoneNumber",
  "name",
  "payment",
];

export const downloadMoFields = [
  ...downloadFields,
  "discountPrice",
  "beforeDiscountPrice",
  "cancelReason",
];
