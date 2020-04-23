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

## Build Setup

```bash
# install dependencies
$ npm install

# copy and edit project.js file
$ cp src/config/default/ownplate-dev.js src/config/project.js

# copy and edit .firebaserc file
$ cp src/config/default/.firebaserc .

# set config to cloud functions.

firebase functions:config:set \
stripe.secret_key="sk_xxx"
```

# serve with hot reload at localhost:3000
$ STRIPE_CLIENT_ID=xxx STRIPE_API_KEY=xxx GAPIKey=xxx npm run dev

GAPIKey is google API key for Google Map
STRIPE_CLIENT_ID and STRIPE_API_KEY are Stripe's id.

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate

# "devsync": "HOST=192.168.100.20 PORT=3333 nuxt",
# ローカル環境（PC）を自分のスマホで確認したい場合、同じネットワークに接続してHOST={IPアドレス}を指定してあげれば、スマホからも確認できます
$ npm run devsync

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


## Function

You need to deploy Function for	develoment.

```
cd functions && npm install
firebase deploy --only functions
```

## icon lists

https://fontawesome.com/icons?d=gallery
https://materialdesignicons.com/cdn/2.0.46/

