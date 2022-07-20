# by user
- cart 
  - wasOrderCreatedJp
- order
  - stripeCreateIntent  (pay)
  - orderPlaceJp (not pay)


# by shop
- accept
  - stripeConfirmIntent (pay)
  - orderUpdateJp ( not pay)
- ready  
  - orderUpdateJp (both)
- completed  
  - orderUpdateJp (both)
- change
 - orderChangeJp (both)

# by user and customer
- cancel
  - stripeCancelIntent( both pay and not pay, both accept(by user, shop) and ready(by shop) )
