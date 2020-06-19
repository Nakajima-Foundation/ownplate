![OwnPlate-Logo](https://github.com/Nakajima-Foundation/ownplate/blob/master/src/static/OwnPlate-Logo-Horizontal-YellowBlack.svg)

# OwnPlate

This is an open source project for a take-out order service, which allows restaurants to create their own menu + order page. Unlike Caviar or UberEats (which charges 12% to 30% + credit card transaction fee), it costs only the credit card transaction fee (via Stripe, 2.9% + 30cents). 

It is built with Firebase + Vue + Stripe, for productivity and scalability.

[SPEC](./docs/SPEC.md)


## Setup Firebase

 - Authentication
   - Enable email/password and phone authentication as Sign-in providers
   - Add your domain if you use custom domain.
 - Database
   - Create Firestore database
 - Hosting
   - Enable hosting
   - Add your domain if you use custom domain.
 - Storage
   - Enable Storage.
 - Functions
   - Enable functions.
   
## Setup Stripe
TBD.

## Setup OwnPlate configuration

### Environment variable
TBD.

### nuxt.config.js
TBD.

### src/config/project.js 
TBD.

## Deploy to firebase
see CircleCI setting.
[.circleci/config.yml](./.circleci/config.yml)

# Run the development server on localhost

```
# install dependencies
$ npm install

# copy and edit project.js file
$ cp src/config/default/ownplate-dev.js src/config/project.js

$ STRIPE_CLIENT_ID=xxx STRIPE_API_KEY=xxx GAPIKey=xxx npm run dev
```
GAPIKey is google API key for Google Map
STRIPE_CLIENT_ID and STRIPE_API_KEY are Stripe's id.


## Build Vue.js.

see CircleCI setting.
This file 
[.circleci/config.yml](./.circleci/config.yml)

This file contains the latest and valid information for the build.

# Build for production and launch server
```
$ npm run build
$ npm run start
```

# Generate static project
```
$ npm run generate
```

#  Test with a smartphone on your local network
"devsync": "HOST=192.168.100.20 PORT=3333 nuxt",

If you want to check the local environment with your smartphone, you can also check from your smartphone to specify HOST = {IP address} on local network.

```
$ npm run devsync
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


## Function

You need to deploy Function for	develoment.

```
cd functions && npm install
firebase deploy --only functions
```

## icon lists

https://iconify.design/icon-sets/mdi/

https://fontawesome.com/icons?d=gallery
https://materialdesignicons.com/cdn/2.0.46/

