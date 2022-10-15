# by customer
- cart 
  - wasOrderCreatedJp (orderCreated)
- order
  - orderPlaceJp
  ( set sendSMS = true)

# by shop
- accept
  - orderUpdateJp  (message)
- ready  
  - orderUpdateJp (both) (message, megKey is msg_cooking_completed / never send if the estimate time is more than one day ahead)
- completed  
  - orderUpdateJp (both)
- change
  - orderChangeJp (both) (sms)
- cancel credit payment
  - stripePaymentCancelIntent(pay) (sms)

# by customer and shop
- cancel
  - stripeCancelIntent( both pay and not pay, both accept(by customer, shop) and ready(by shop) ) (sms)

