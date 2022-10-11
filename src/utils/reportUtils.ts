const reportHeadersTop = ["name", "restaurantName", "type", "statusName", "userName"];
const reportHeadersTopMo = ["name", "storeName", "type", "statusName", "userName"];
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
  "isDelivery",
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
