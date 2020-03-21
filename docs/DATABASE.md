

/restaurants/:restaurantsId
```
{
 name: shop name (string, required)
 address: shop address (string, required)
 phone: shop phone number (string, required)
 uid: firebase user uid (string, required)
 web_url: url (string)

 default_tax_rate: rate (number)

}
```

/restaurants/:restaurantsId/menu/:menuId
```
{
 name: name (string, required)
 price: price (number, required)
 tax_rate: rate (number) 
 description: description (string)
}
```
