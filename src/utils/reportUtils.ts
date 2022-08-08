const reportHeadersTop = [
  "name",
  "restaurantName",
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

const reportHeadersItem = [
  "itemName",
  "options",
  "category1",
  "category2",
];

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
export const reportHeadersForMo = [];
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

export const revenueHeader = [
  "date",
  "restaurantName",
  "orderStatus",
  "foodRevenue",
  "foodTax",
  "alcoholRevenue",
  "salesTax",
  "tipShort",
  "serviceTax",
  "total",
  "revenue",
  "name",
  "payment",
];
