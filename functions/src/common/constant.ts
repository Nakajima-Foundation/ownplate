export const order_status = {
  error: 0,
  new_order: 100, // by user
  validation_ok: 200, // by functions
  customer_paid: 300,  // by user and stripe
  order_accepted: 400, // by restaurant
  cooking_completed: 500, // by restaurant
  customer_picked_up: 600, // by restaurant
};

export const order_error = {
  validation_error: 100,
  order_canceled_by_customer: 200,
  payment_error: 300,
  order_canceled_by_restaurant: 400,
  unknow_error: 900,
};
