# OwnPlate Project

## Overview
This is an open source project for a curbside food pick-up service, which allows restaurants to create their own menu + order page and efficiently run a food pick-up service. Unlike Caviar or UberEats (which charges 15% to 30% + credit card transaction fee), it costs only the credit card transaction fee (via Stripe, 2.9% + 30cents). 

It is built with Firebase + Vue + Stripe, for productivity and scalability.

## Minimum Viable Product (Phase 0)
Restaurants can
 - login using e-mail
 - create its own page, with restaurant name, banner, address, phone number, homepage url
 - enter the menu with prices and tax (and available time)
 - associate a Stripe account (to receive payment)
 - be notified for a new order
 - see the list of pending orders
 - remove orders that have been picked up

Customers can
 - log in using Phone SMS
 - see the menu
 - order items (shopping cart) and pay
 - let the service remember the credit card (via Stripe)

## Additional Features (Phase 1)
Restaurant can
 - be notified when the customer has arrived (curbside pickup)
 - verify the identity of customer on pick-up

Customers can
 - specify the pickup time
 - pickup at the curbside  
 - see the status of the order
 - pay tips beforer or after pick-up
 - like/share restaurants 
 - like/share individual menu item (with OGP!)
 - give feedback (stars and text) to the restaurant
 - click the address to start the navigation
 - see "other restaurants in this area"

## Additional Features (Phase 2, for-profit)
Premium (paid) Restaurant can
 - select customer reviews to be displayed on the menu page
 - remove "other restaurants in this area" from its menu page
 - be recommended in menu page of other restaurants
 - be promoted in the restaurant browser and search result
 - send coupons and specials to customers
 - offer royalty program

Customers can
 - browse restaurants
 - search Restaurants using text or from map or current location
