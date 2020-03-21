

/restaurants/:restaurantsId
```
{
 name: shop name (string, required)
 address: shop address (string, required)
 phone: shop phone number (string, required)
 uid: firebase user uid (string, required)
 web_url: url (string)
}
```

/restaurants/:restaurantsId/menu/:menuId
```
{
 name: name (string, required)
 price: price (number, required)
 description: description (string)
}
```
