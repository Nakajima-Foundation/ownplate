```
export const order_status = {
  error: 0,
  new_order: 100, // by user
  validation_ok: 200, // by functions
  order_placed: 300, // by user and stripe
  order_accepted: 400, // by restaurant
  cooking_completed: 500, // by restaurant
  customer_picked_up: 600, // by restaurant and stripe
  order_canceled: 700, // by restaurant or user
  order_refunded: 800 // by restaurant
};
```

# Order State Time
 - order_status.new_order  "timeCreated" (app/user/RestaurantPage.vue) exists
 - order_status.order_placed "orderPlacedAt" (order function place) new
 - order_status.order_accepted "orderAcceptedAt" (order funciton update) new
 - order_status.cooking_completed "orderCookingCompletedAt" (order function update) new
 - order_status.customer_picked_up "orderCustomerPickedUpAt" (order  funciton update) new
 - order_status.order_canceled "timeCanceld" (functions/src/stripe/intent stript intent) exists
   -  user "orderCustomerCanceledAt" new
   -  restaurant "orderRestaurantCanceledAt" new


#
