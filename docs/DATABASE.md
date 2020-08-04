This document is too old.
Please check source code.

/restaurants/:restaurantsId
```
{
 name: shop name (string, required)
 address: shop address (string, required)
 phone: shop phone number (string, required)
 uid: firebase user uid (string, required)
 web_url: url (string)

 default_tax_rate: rate (number)

 public_flag: flag (boolean, required)

}
```

/restaurants/:restaurantsId/menu/:menuId
```
{
 name: name (string, required)
 price: price (number, required)
 tax_rate: rate (number) 
 description: description (string)

 public_flag: flag (boolean, required)

}
```

/restaurants/:restaurantsId/order/:orderId
```
{
 order_time: time (timestamp, required)
 customer: userId (string, required)
 phone: phone_number  (string, required)
 status: status (number, required)
 order: [
   {
     menu_id: (string, required)
     number: (number, required)
     subtotal_price: (number, required)
   }
   total_price: (number, required)
 ]
}
```

The user can get own orders using CollectionGroup.


/users/:userId
```
TBD
```
