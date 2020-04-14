import express from 'express';
import OGP from './ogp';
import Stripe from './stripe'

const app = express()

app.use('/r', OGP);
app.use('/1.0/stripe', Stripe)

export default app
