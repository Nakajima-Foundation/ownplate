![OwnPlate-Logo](https://github.com/Nakajima-Foundation/ownplate/blob/master/public/OwnPlate-Logo-Horizontal-YellowBlack.svg)

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
 - AppCheck
   - Enable App Check
   
## Setup Stripe
TBD.

## Setup OwnPlate configuration

### Environment variable
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

$ npm run start
```

## Build Vue.js.

see CircleCI setting.
This file 
[.circleci/config.yml](./.circleci/config.yml)

This file contains the latest and valid information for the build.

# Build for production
```
$ npm run build
```

## Function

You need to deploy Function for	develoment.

```
cd functions && npm install
firebase deploy --only functions
```

## Icon lists

https://materializecss.com/icons.html
https://iconify.design/icon-sets/mdi/

https://fontawesome.com/icons?d=gallery
https://materialdesignicons.com/cdn/2.0.46/

