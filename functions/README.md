# by user
- cart 
  - wasOrderCreatedJp
- order
  - stripeCreateIntent  (pay)
  - orderPlaceJp (not pay)
  ( set sendSMS = true)

# by shop
- accept
  - stripeConfirmIntent (pay) (message)
  - orderUpdateJp (not pay) (message)
- ready  
  - orderUpdateJp (both) (message, megKey is msg_cooking_completed / never send if the estimate time is more than one day ahead)
- completed  
  - orderUpdateJp (both)
- change
  - orderChangeJp (both) (sms)
- cancel credit payment
  - stripePaymentCancelIntent(pay) (sms)

# by user and customer
- cancel
  - stripeCancelIntent( both pay and not pay, both accept(by user, shop) and ready(by shop) ) (sms)

