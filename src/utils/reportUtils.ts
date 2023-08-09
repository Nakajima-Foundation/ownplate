const reportHeadersTop = [
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

  "discountPrice",

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

  "discountPrice",

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

  "discountPrice",

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
  "discount",
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

