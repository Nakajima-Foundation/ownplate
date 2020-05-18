# Firebase Functions

- stripe.secret_key - Stripe secret key
- locale.region - region. US, JP, EU
- aws.id - AWS id for sms push
- aws.secret - AWS secret for sms push
- senty.dsn - SENTY endpoint for Functions ( client dsn set src/config/project.js )
- line.secret - LINE secret for the Login channel
- line.message_token - LINE access token (long-lived) for the Message API channel

# Environment variables for build client

- STRIPE_API_KEY - Stripe public key
- STRIPE_CLIENT_ID - Stripe oauth client id
- GAPIKey - Google map api key
- REGION - ~~Region. US, JP, EU~~ Not support now. Moved to project.js
- LOCALE - ~~vue i18n locale (us, ja, eu)~~ Not support now. vue i18n locale is set by REGION. 

# Firebase web client (Vue.js) configurations
- src/config/project.js - configuration file.
