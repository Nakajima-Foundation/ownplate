const headersTop = [
  "name",
  "restaurantName",
  "statusName",
  "userName",
];
const headersTime = [
  "datePlaced",
  "dateAccepted",
  "dateConfirmed",
  "dateCompleted",
  "timeRequested",
  "timeToPickup",
];

const headersItem = [
  "itemName",
  "options",
  "category1",
  "category2",
];

export const headers = [
  ...headersTop,
  "phoneNumber",
  ...headersTime,
  
  ...headersItem,
  "count",
  "total",
  "payment",
  "memo",
];
export const headersForMo = [];
export const headersWithAddress = [
  ...headersTop,
  
  "ec.name",
  "ec.zip",
  "ec.prefecture",
  "ec.address",
  "ec.email",
  
  "phoneNumber",
  
  ...headersTime,
  
  ...headersItem,
  "count",
  "total",
  "shippingCost",
  "payment",
  "isDelivery",
  "memo",
]
